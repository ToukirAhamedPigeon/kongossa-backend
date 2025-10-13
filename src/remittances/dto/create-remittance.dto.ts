import { IsNotEmpty, IsNumber, IsString, IsOptional, IsJSON } from 'class-validator';

export class CreateRemittanceDto {
  @IsNumber()
  agentId: number;

  @IsJSON()
  senderDetails: object;

  @IsJSON()
  recipientDetails: object;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsNumber()
  sourceAmount: number;

  @IsOptional()
  @IsString()
  sourceCurrency?: string;

  @IsOptional()
  @IsNumber()
  destinationAmount?: number;

  @IsOptional()
  @IsString()
  destinationCurrency?: string;

  @IsString()
  deliveryMethod: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
