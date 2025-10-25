// src/stripe/dto/stripe-checkout.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class StripeCheckoutDto {
  @IsOptional()
  @IsString()
  session_id?: string;
}
