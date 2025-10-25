import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UserExpenseStatsDto } from './dto/user-expense-stats.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  // -----------------------------
  // CRUD Routes
  // -----------------------------

  @Get()
  async index() {
    return this.service.getAllExpenses();
  }

  @Get('create')
  async create() {
    // Could return meta info like categories for the user
    return this.service.getExpenseMeta();
  }

  @Post()
  async store(@Body() dto: CreateExpenseDto) {
    return this.service.createExpense(dto);
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    return this.service.getExpenseById(Number(id));
  }

  @Get(':id/edit')
  async edit(@Param('id') id: string) {
    return this.service.getExpenseById(Number(id)); // could include metadata
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.service.updateExpense(Number(id), dto);
  }

  @Delete(':id')
  async destroy(@Param('id') id: string) {
    return this.service.deleteExpense(Number(id));
  }

  // -----------------------------
  // User-specific
  // -----------------------------
  @Get('user/:userId')
  async getUserExpenses(@Param('userId') userId: string) {
    return this.service.getUserExpenses(Number(userId));
  }

  @Get('stats/user')
  async getUserExpenseStats(@Query() dto: UserExpenseStatsDto) {
    return this.service.getUserExpenseStats(dto.startDate, dto.endDate);
  }
}
