// src/dashboard/dto/dashboard-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class BudgetStatsDto {
  @ApiProperty({ example: 10, description: 'Total number of budgets' })
  total: number;

  @ApiProperty({ example: 5, description: 'Number of active budgets' })
  active: number;

  @ApiProperty({ example: 10000, description: 'Total allocated budget' })
  totalAllocated: number;

  @ApiProperty({ example: 7500, description: 'Total spent amount' })
  totalSpent: number;

  @ApiProperty({ example: 2, description: 'Number of budgets that are over budget' })
  overBudgetCount: number;
}

class TontineStatsDto {
  @ApiProperty({ example: 3, description: 'Total number of tontines' })
  total: number;

  @ApiProperty({ example: 2, description: 'Number of active tontines' })
  active: number;

  @ApiProperty({ example: 5000, description: 'Total amount contributed by the user' })
  totalContributed: number;

  @ApiProperty({ example: 4500, description: 'Total amount received from tontines' })
  totalReceived: number;

  @ApiProperty({ example: 1, description: 'Number of pending invites in tontines' })
  pendingInvites: number;
}

class ExpenseDto {
  @ApiProperty({ example: 1, description: 'Expense ID' })
  id: number;

  @ApiProperty({ example: 'Groceries', description: 'Expense title' })
  title: string;

  @ApiProperty({ example: 50, description: 'Expense amount' })
  amount: number;

  @ApiProperty({ example: 'Food', description: 'Expense category' })
  category: string;

  @ApiProperty({ example: '2025-10-25T12:00:00Z', description: 'Date of the expense' })
  date: Date;
}

class PayoutDto {
  @ApiProperty({ example: 1, description: 'Payout ID' })
  id: number;

  @ApiProperty({ example: 'Weekly Tontine', description: 'Name of the tontine' })
  tontine_name: string;

  @ApiProperty({ example: '2025-10-30', description: 'Scheduled payout date' })
  payout_date: string;

  @ApiProperty({ example: 500, description: 'Payout amount' })
  amount: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: BudgetStatsDto })
  budgets: BudgetStatsDto;

  @ApiProperty({ type: TontineStatsDto })
  tontines: TontineStatsDto;

  @ApiProperty({ type: [ExpenseDto], description: 'List of recent expenses' })
  recentExpenses: ExpenseDto[];

  @ApiProperty({ type: [PayoutDto], description: 'List of upcoming payouts' })
  upcomingPayouts: PayoutDto[];
}
