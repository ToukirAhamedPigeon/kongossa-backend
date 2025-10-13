import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateSavedContactDto {
  @IsInt()
  agentId: number;

  @IsString()
  contactType: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;
}
