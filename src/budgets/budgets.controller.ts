import { Controller, Get, Param, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post('create')
  async createBudget(@Body() dto: CreateBudgetDto) {
    return this.budgetsService.createBudget(dto);
  }

  @Get(':id/stats')
  async getBudgetStats(@Param('id') id: string, @Query('period') period?: string) {
    return this.budgetsService.getBudgetStats(Number(id), period);
  }

  @Get(':id/summary')
  async getBudgetSummary(@Param('id') id: string, @Query('period') period?: string) {
    return this.budgetsService.getBudgetSummary(Number(id), period);
  }
}
