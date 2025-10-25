import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateBudgetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  period?: string;
}
