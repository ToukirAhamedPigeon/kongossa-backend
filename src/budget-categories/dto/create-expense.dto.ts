import { IsString, IsNotEmpty, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  expenseDate: string;
}
