import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateBudgetCategoryDto } from './dto/create-budget-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // List all budgets
  @Get()
  async getBudgets() {
    return this.budgetsService.getBudgets();
  }

  // Create budget
  @Post()
  async createBudget(@Body() dto: CreateBudgetDto) {
    return this.budgetsService.createBudget(dto);
  }

  // Show budget
  @Get(':id')
  async getBudget(@Param('id') id: string) {
    return this.budgetsService.getBudget(Number(id));
  }

  // Update budget
  @Put(':id')
  async updateBudget(@Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.updateBudget(Number(id), dto);
  }

  // Delete budget
  @Delete(':id')
  async deleteBudget(@Param('id') id: string) {
    return this.budgetsService.deleteBudget(Number(id));
  }

  // Stats
  @Get(':id/stats')
  async getBudgetStats(@Param('id') id: string, @Query('period') period?: string) {
    return this.budgetsService.getBudgetStats(Number(id), period);
  }

  // Summary
  @Get(':id/summary')
  async getBudgetSummary(@Param('id') id: string, @Query('period') period?: string) {
    return this.budgetsService.getBudgetSummary(Number(id), period);
  }

  // Add category to budget
  @Post(':id/categories')
  async addCategory(
    @Param('id') id: string,
    @Body() dto: CreateBudgetCategoryDto,
  ) {
    return this.budgetsService.addCategory(Number(id), dto);
  }
}
