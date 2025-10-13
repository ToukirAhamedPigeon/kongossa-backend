export class CreateTransactionLimitDto {
  userId: number;
  daily: number;
  weeklyBudget?: number;
  monthlyBudget?: number;
  yearlyBudget?: number;
}