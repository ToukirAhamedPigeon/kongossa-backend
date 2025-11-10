import {
  Controller,
  Get,
  Req,
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
async index(
  @Req() req: any,
  @Query('search') search?: string,
  @Query('category') category?: string,
  @Query('dateFrom') dateFrom?: string,
  @Query('dateTo') dateTo?: string,
) {
  const userId = req.user.id;
  return {
    expenses: await this.service.getUserExpenses(userId, { search, category, dateFrom, dateTo }),
  };
}

  @Get('create')
  async create() {
    // Could return meta info like categories for the user
    return await this.service.getExpenseMeta();
  }

  @Post()
  async store(@Body() dto: CreateExpenseDto) {
    try {
      return this.service.createExpense(dto);
    } catch (error) {
      console.error('Error creating expense:', error);
      throw new Error('Failed to create expense');
    }
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

  // -------------------------
  // Get expense statistics
  // -------------------------
  @Get('stats')
  async stats(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id;
    return this.service.getUserExpenseStats(userId, startDate, endDate);
  }
}
