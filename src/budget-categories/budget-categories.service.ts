// src/budget-categories/budget-categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class BudgetCategoriesService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.budgetCategory.findMany();
  }

  async getCategoryById(id: number) {
    const category = await this.prisma.budgetCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createForBudget(budgetId: number, dto: CreateCategoryDto) {
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

  async updateCategory(id: number, dto: CreateCategoryDto) {
    await this.getCategoryById(id); // ensure it exists
    return this.prisma.budgetCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        limitAmount: dto.limitAmount ?? 0,
      },
    });
  }

  async deleteCategory(id: number) {
    await this.getCategoryById(id); // ensure it exists
    return this.prisma.budgetCategory.delete({
      where: { id },
    });
  }

  async getCategoryStats(id: number) {
    const category = await this.prisma.budgetCategory.findUnique({
      where: { id },
      include: { expenses: true },
    });
    if (!category) throw new NotFoundException('Category not found');

    const totalSpent = category.expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      id: category.id,
      name: category.name,
      totalSpent,
      expenseCount: category.expenses.length,
    };
  }

  async createExpenseForCategory(categoryId: number, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        budgetCategoryId: categoryId,
        title: dto.title,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
      },
    });
  }
}
