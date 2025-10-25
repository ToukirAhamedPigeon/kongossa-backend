// src/budget-categories/budget-categories.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { BudgetCategoriesService } from './budget-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budget-categories')
@UseGuards(JwtAuthGuard)
export class BudgetCategoriesController {
  constructor(private readonly service: BudgetCategoriesService) {}

  // ------------------------
  // CATEGORY CRUD
  // ------------------------

  // GET /budget-categories
  @Get()
  async index() {
    return this.service.getAllCategories();
  }

  // GET /budget-categories/create
  @Get('create')
  async create() {
    // Could return default values, enums, or necessary data for creating category
    return { message: 'Provide name, description, color, limitAmount' };
  }

  // GET /budget-categories/:id
  @Get(':id')
  async show(@Param('id') id: string) {
    return this.service.getCategoryById(Number(id));
  }

  // GET /budget-categories/:id/edit
  @Get(':id/edit')
  async edit(@Param('id') id: string) {
    // Return existing category data for editing
    return this.service.getCategoryById(Number(id));
  }

  // POST /budget-categories/:budgetId/categories
  @Post(':budgetId/categories')
  async createForBudget(
    @Param('budgetId') budgetId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.createForBudget(Number(budgetId), dto);
  }

  // PUT /budget-categories/:id
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.updateCategory(Number(id), dto);
  }

  // DELETE /budget-categories/:id
  @Delete(':id')
  async destroy(@Param('id') id: string) {
    return this.service.deleteCategory(Number(id));
  }

  // GET /budget-categories/:id/stats
  @Get(':id/stats')
  async getCategoryStats(@Param('id') id: string) {
    return this.service.getCategoryStats(Number(id));
  }

  // POST /budget-categories/:id/expenses
  @Post(':id/expenses')
  async createExpenseForCategory(
    @Param('id') id: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.service.createExpenseForCategory(Number(id), dto);
  }
}
