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
