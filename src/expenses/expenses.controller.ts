import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserExpenseStatsDto } from './dto/user-expense-stats.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get('user/:userId')
  async getUserExpenses(@Param('userId') userId: string) {
    return this.service.getUserExpenses(Number(userId));
  }

  @Get('stats/user')
  async getUserExpenseStats(@Query() dto: UserExpenseStatsDto) {
    return this.service.getUserExpenseStats(dto.startDate, dto.endDate);
  }
}
