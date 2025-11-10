import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async getBudgets(params?: { search?: string; period?: string; page?: number; limit?: number }) {
  const { search, period, page = 1, limit = 10 } = params || {};

  const where: any = {};
  // 🔍 Search filter
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  // ⏱ Period filter
  if (period) {
    where.period = period;
  }

  // 📄 Pagination
  const skip = (page - 1) * limit;

  // 🧮 Fetch budgets with filters + pagination
  const [budgets, total] = await Promise.all([
    this.prisma.budget.findMany({
      where,
      skip,
      take: limit,
      include: {
        categories: {
          include: { expenses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.budget.count({ where }),
  ]);

  // 🧾 Calculate extra fields
  const result = budgets.map((budget) => {
    const total_spent = budget.categories.reduce((sum, c) => {
      const spent = c.expenses?.reduce((s, e) => s + (e.amount ?? 0), 0) ?? 0;
      return sum + spent;
    }, 0);

    const usage_percentage = budget.totalAmount
      ? (total_spent / budget.totalAmount) * 100
      : 0;

    const is_over_budget = total_spent > budget.totalAmount;

    return {
      ...budget,
      total_spent,
      usage_percentage,
      is_over_budget,
      categories_count: budget.categories.length,
    };
  });

  // 🧮 Pagination metadata for frontend
  const last_page = Math.ceil(total / limit);

  return {
    data: result,
    total,
    current_page: page,
    last_page,
    per_page: limit,
  };
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
      include: {
        categories: {
          include: {
            expenses: true,
          },
        },
      },
    });

    if (!budget) throw new NotFoundException('Budget not found');

    // Flatten and attach category details to each expense
    const allExpenses = budget.categories.flatMap((category) =>
      (category.expenses || []).map((expense) => ({
        ...expense,
        budgetCategoryName: category.name,       // ✅ add category name
        budgetCategoryColor: category.color,     // ✅ optional
        budgetCategoryLimit: category.limitAmount, // ✅ optional
      }))
  );

  return {
    ...budget,
    expenses: allExpenses,
  };
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
