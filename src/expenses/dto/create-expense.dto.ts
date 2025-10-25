import { IsString, IsNumber, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateExpenseDto {
  @IsInt()
  budgetCategoryId: number;

  @IsString()
  title: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
