import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateTontineDto {
  @IsString() name: string;
  @IsString() type: string;
  @IsNumber() contributionAmount: number;
  // @IsNumber() userId: number;
  @IsString() contributionFrequency: string;
  @IsNumber() @IsOptional() durationMonths?: number;
  @IsArray() @IsOptional() coAdminIds?: number[];
  @IsArray() @IsOptional() paymentMethods?: string[];
}
