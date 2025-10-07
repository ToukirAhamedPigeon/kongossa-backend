import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO (Data Transfer Object) for creating a transaction.
 * This ensures that any input from clients is validated before processing.
 */
export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  senderId: number; // User ID of the sender

  @IsOptional()
  @IsNumber()
  recipientId?: number; // Optional recipient ID for internal transfers

  @IsNotEmpty()
  @IsNumber()
  amount: number; // Transaction amount

  @IsOptional()
  @IsString()
  currency?: string = 'USD'; // Default currency is USD

  @IsNotEmpty()
  @IsString()
  type: string; // Type of transaction (send, receive, deposit, etc.)

  @IsOptional()
  @IsString()
  status?: string = 'pending'; // Default status is pending

  @IsOptional()
  @IsString()
  paymentMethod?: string; // Payment method (e.g., bank, card, crypto)

  @IsOptional()
  @IsString()
  description?: string; // Optional transaction description

  @IsOptional()
  @IsNumber()
  fee?: number = 0; // Transaction fee, default 0

  @IsOptional()
  @IsNumber()
  exchangeRate?: number; // Optional exchange rate if currency conversion

  @IsOptional()
  @IsString()
  referenceNumber?: string; // Unique reference number

  @IsOptional()
  @IsString()
  qrCode?: string; // Optional QR code associated with transaction
}
