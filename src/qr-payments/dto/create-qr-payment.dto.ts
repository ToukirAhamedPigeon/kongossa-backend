import { IsString, IsNumber, IsOptional, IsDate, IsBoolean } from 'class-validator';

export class CreateQRPaymentDto {
  @IsString()
  qrCode: string;

  @IsNumber()
  recipientId: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @IsString()
  @IsOptional()
  paymentType?: string; // one_time, recurring, open_amount
}
