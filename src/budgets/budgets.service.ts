import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async getBudgets() {
    return this.prisma.budget.findMany({ include: { categories: true } });
  }

  async createBudget(dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        name: dto.name,
        totalAmount: dto.totalAmount,
        period: dto.period || 'monthly',
        userId: 1, // Replace with auth user ID
      },
    });
  }

  async getBudget(id: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { categories: true },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async updateBudget(id: number, dto: UpdateBudgetDto) {
    await this.getBudget(id);
    return this.prisma.budget.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBudget(id: number) {
    await this.getBudget(id);
    return this.prisma.budget.delete({ where: { id } });
  }

  async getBudgetStats(id: number, period?: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { categories: { include: { expenses: true } } },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    const totalSpent = budget.categories
      .flatMap((c) => c.expenses)
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
      totalSpent: budget.categories.flatMap((c) => c.expenses).reduce((sum, e) => sum + e.amount, 0),
      categoryCount: budget.categories.length,
      period: period || 'monthly',
    };
  }

  async addCategory(budgetId: number, dto: CreateBudgetCategoryDto) {
    await this.getBudget(budgetId);
    return this.prisma.budgetCategory.create({
      data: {
        budgetId,
        name: dto.name,
        description: dto.description,
        color: dto.color,
        limitAmount: dto.limitAmount || 0,
      },
    });
  }
}
