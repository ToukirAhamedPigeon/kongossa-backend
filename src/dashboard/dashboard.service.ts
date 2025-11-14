// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { addDays, addWeeks, addMonths, isFuture } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: number): Promise<DashboardResponseDto> {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: {
        categories: {
          include: {
            expenses: true,
          },
        },
      },
    });

    const totalAllocated = budgets.reduce(
      (sum, b) => sum + Number(b.totalAmount),
      0
    );

    const totalSpent = budgets
      .flatMap((b) => b.categories.flatMap((c) => c.expenses))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const overBudgetCount = budgets.filter((b) => {
      const spent = b.categories
        .flatMap((c) => c.expenses)
        .reduce((s, e) => s + Number(e.amount), 0);

      return spent > Number(b.totalAmount);
    }).length;

    // Tontine stats
    const tontineMemberships = await this.prisma.tontineMember.findMany({
      where: { userId },
      include: {
        tontine: true,
      },
    });

    const contributions = await this.prisma.tontineContribution.findMany({
      where: { userId },
    });

    const totalContributed = contributions.reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );

    const payouts = await this.prisma.tontinePayout.findMany({
      where: { tontineMemberId: { in: tontineMemberships.map((m) => m.id) } },
    });

    const totalReceived = payouts.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const pendingInvites = await this.prisma.tontineInvite.count({
      where: { status: 'pending' },
    });

    // Recent expenses
    const recentExpenses = await this.prisma.expense.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { budgetCategory: true },
    });

    const formattedExpenses = recentExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: Number(e.amount),
      category: e.budgetCategory.name,
      date: e.expenseDate,
    }));

    // Upcoming payouts
    const upcomingPayouts = tontineMemberships
      .map((m) => {
        const t = m.tontine;
        if (!t.startDate) return null;

        const startDate = new Date(t.startDate);
        const rounds = 0; // TODO: priority order mapping
        let payoutDate: Date;

        // FIXED: use t.frequency, NOT t.contributionFrequency
        switch (t.frequency) {
          case 'daily':
            payoutDate = addDays(startDate, rounds);
            break;
          case 'weekly':
            payoutDate = addWeeks(startDate, rounds);
            break;
          case 'monthly':
          default:
            payoutDate = addMonths(startDate, rounds);
            break;
        }

        if (isFuture(payoutDate)) {
          return {
            id: m.id,
            tontine_name: t.name,
            payout_date: payoutDate.toISOString().split('T')[0],

            // FIXED: Decimal * number
            amount: Number(t.contributionAmount) * (t.maxMembers ?? 0),
          };
        }

        return null;
      })
      .filter(Boolean)
      .slice(0, 5);

    return {
      budgets: {
        total: budgets.length,
        active: budgets.length,
        totalAllocated,
        totalSpent,
        overBudgetCount,
      },
      tontines: {
        total: tontineMemberships.length,
        active: tontineMemberships.length,
        totalContributed,
        totalReceived,
        pendingInvites,
      },
      recentExpenses: formattedExpenses,
      upcomingPayouts: upcomingPayouts as any[],
    };
  }
}
