export class CreateCheckoutDto {
  amount: number;
  currency: string;
  description?: string;

  // metadata (tontine_id, user_id, etc.)
  metadata?: Record<string, any>;
}
