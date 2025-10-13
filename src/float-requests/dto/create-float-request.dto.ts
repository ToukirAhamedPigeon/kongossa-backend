import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFloatRequestDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsNumber()
  agentId: number;
}
