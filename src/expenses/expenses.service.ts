import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async getAllExpenses() {
    return this.prisma.expense.findMany({
      include: { budgetCategory: true },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async getExpenseMeta() {
    // Example: return budget categories for current user
    return this.prisma.budgetCategory.findMany();
  }

  async createExpense(dto: CreateExpenseDto) {
    try {
      console.log('Creating expense with DTO:', dto);
      const result = await this.prisma.expense.create({ data: {
        budgetCategoryId: dto.budgetCategoryId,
        title: dto.title,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
      }});
      console.log('Expense created:', result);
      return result;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }
  }

  async getExpenseById(id: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { budgetCategory: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async updateExpense(id: number, dto: UpdateExpenseDto) {
    await this.getExpenseById(id);

    return this.prisma.expense.update({
      where: { id },
      data: {
        budgetCategoryId: dto.budgetCategoryId,
        title: dto.title,
        amount: dto.amount,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined
      },
    });
}

  async deleteExpense(id: number) {
    await this.getExpenseById(id); // check existence
    return this.prisma.expense.delete({ where: { id } });
  }

  // -------------------------
  // Get all expenses for a user
  // -------------------------
  async getUserExpenses(
  userId: number,
  filters?: { search?: string; category?: string; dateFrom?: string; dateTo?: string },
) {
  const { search, category, dateFrom, dateTo } = filters || {};

  const expenses = await this.prisma.expense.findMany({
    where: {
      budgetCategory: { budget: { userId } },
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(category ? { budgetCategoryId: Number(category) } : {}),
      ...(dateFrom ? { expenseDate: { gte: new Date(dateFrom) } } : {}),
      ...(dateTo ? { expenseDate: { lte: new Date(dateTo) } } : {}),
    },
    include: {
      budgetCategory: {
        include: {
          budget: true,
          expenses: true,
        },
      },
    },
    orderBy: { expenseDate: 'desc' },
  });

  return expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    expenseDate: e.expenseDate.toISOString(),
    expenseDateFormatted: e.expenseDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    daysAgo: this.getDiffForHumans(e.expenseDate),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    budgetCategory: {
      id: e.budgetCategory.id,
      name: e.budgetCategory.name,
      color: e.budgetCategory.color,
      limitAmount: e.budgetCategory.limitAmount,
      totalSpent: e.budgetCategory.expenses.reduce((sum, ex) => sum + ex.amount, 0),
      description: e.budgetCategory.description,
      remainingAmount:
        e.budgetCategory.limitAmount -
        e.budgetCategory.expenses.reduce((sum, ex) => sum + ex.amount, 0),
      isOverLimit:
        e.budgetCategory.expenses.reduce((sum, ex) => sum + ex.amount, 0) >
        e.budgetCategory.limitAmount,
      usagePercentage:
        e.budgetCategory.limitAmount > 0
          ? e.budgetCategory.expenses.reduce((sum, ex) => sum + ex.amount, 0) /
            e.budgetCategory.limitAmount
          : 0,
      expensesCount: e.budgetCategory.expenses.length,
      createdAt: e.budgetCategory.createdAt.toISOString(),
      updatedAt: e.budgetCategory.updatedAt.toISOString(),
      budget: {
        id: e.budgetCategory.budget.id,
        name: e.budgetCategory.budget.name,
        period: e.budgetCategory.budget.period,
        totalAmount: e.budgetCategory.budget.totalAmount,
        createdAt: e.budgetCategory.budget.createdAt.toISOString(),
        updatedAt: e.budgetCategory.budget.updatedAt.toISOString(),
      },
      expenses: e.budgetCategory.expenses.map((ex) => ({
        id: ex.id,
        budgetCategoryId: ex.budgetCategoryId,
        title: ex.title,
        amount: ex.amount,
        expenseDate: ex.expenseDate.toISOString(),
        createdAt: ex.createdAt.toISOString(),
        updatedAt: ex.updatedAt.toISOString(),
      })),
    },
  }));
}


  // -------------------------
  // Expense statistics (like Laravel getUserExpenseStats)
  // -------------------------
  async getUserExpenseStats(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      budgetCategory: { budget: { userId } },
    };

    if (startDate || endDate) where.expenseDate = {};
    if (startDate) where.expenseDate.gte = new Date(startDate);
    if (endDate) where.expenseDate.lte = new Date(endDate);

    const expenses = await this.prisma.expense.findMany({
      where,
      include: { budgetCategory: { include: { budget: true } } },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by budgetCategoryId
    const expensesByCategory = Object.values(
      expenses.reduce((acc, e) => {
        const catId = e.budgetCategoryId;
        if (!acc[catId]) {
          acc[catId] = {
            category: e.budgetCategory.name,
            count: 0,
            total: 0,
          };
        }
        acc[catId].count += 1;
        acc[catId].total += e.amount;
        return acc;
      }, {}),
    );

    return {
      period: {
        start: startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: endDate || new Date(),
      },
      totalExpenses: expenses.length,
      totalAmount,
      averageExpense: expenses.length ? totalAmount / expenses.length : 0,
      largestExpense: expenses.length
        ? Math.max(...expenses.map((e) => e.amount))
        : 0,
      smallestExpense: expenses.length
        ? Math.min(...expenses.map((e) => e.amount))
        : 0,
      expensesByCategory,
    };
  }

  // -------------------------
  // Helper: diffForHumans (like Laravel)
  // -------------------------
  private getDiffForHumans(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }
}
