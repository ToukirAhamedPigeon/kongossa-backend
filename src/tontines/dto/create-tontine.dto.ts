import { IsString, IsNumber, IsOptional, IsDate, IsArray } from 'class-validator';

export class CreateTontineDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @IsNumber()
  contributionAmount: number;

  @IsString()
  contributionFrequency: string;

  @IsString()
  @IsOptional()
  payoutInterval?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsNumber()
  creatorId: number;

  @IsNumber()
  @IsOptional()
  coAdminId?: number;

  @IsNumber()
  @IsOptional()
  maxMembers?: number;

  @IsArray()
  @IsOptional()
  paymentMethods?: string[];

  @IsNumber()
  @IsOptional()
  durationMonths?: number;
}
