import { IsOptional, IsDateString } from 'class-validator';

export class UserExpenseStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
