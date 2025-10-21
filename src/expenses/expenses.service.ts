import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async getUserExpenses(userId: number) {
    return this.prisma.expense.findMany({
      where: { budgetCategory: { budget: { userId } } },
      include: { budgetCategory: true },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async getUserExpenseStats(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) where.expenseDate = {};
    if (startDate) where.expenseDate.gte = new Date(startDate);
    if (endDate) where.expenseDate.lte = new Date(endDate);

    const expenses = await this.prisma.expense.findMany({ where });
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { totalSpent, count: expenses.length };
  }
}
