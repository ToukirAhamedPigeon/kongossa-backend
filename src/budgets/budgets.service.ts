import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async createBudget(dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        name: dto.name,
        totalAmount: dto.totalAmount,
        period: dto.period || 'monthly',
        userId: 1, // replace with auth user id
      },
    });
  }

  async getBudgetStats(id: number, period?: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { categories: { include: { expenses: true } } },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    const totalSpent = budget.categories
      .flatMap(c => c.expenses)
      .reduce((sum, e) => sum + e.amount, 0);

    return { id: budget.id, name: budget.name, totalAmount: budget.totalAmount, totalSpent, period };
  }

  async getBudgetSummary(id: number, period?: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { categories: { include: { expenses: true } } },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    return {
      id: budget.id,
      name: budget.name,
      totalAmount: budget.totalAmount,
      totalSpent: budget.categories.flatMap(c => c.expenses).reduce((sum, e) => sum + e.amount, 0),
      categoryCount: budget.categories.length,
      period: period || 'monthly',
    };
  }
}
