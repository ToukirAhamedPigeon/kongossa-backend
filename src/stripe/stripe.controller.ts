// src/stripe/stripe.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeCheckoutDto } from './dto/stripe-checkout.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * GET /stripe/checkout/success
   * Laravel equivalent: checkoutSuccess()
   */
  @Get('checkout/success')
  async checkoutSuccess(@Query() query: StripeCheckoutDto) {
    // Validate session_id
    if (!query.session_id) {
      throw new BadRequestException('session_id is required');
    }

    // Call service method
    const session = await this.stripeService.checkoutSuccess(query.session_id);

    // Return session data (or handle frontend rendering logic)
    return { session };
  }

  /**
   * GET /stripe/checkout/cancel
   * Laravel equivalent: checkoutCancel()
   */
  @Get('checkout/cancel')
  async checkoutCancel() {
    return this.stripeService.checkoutCancel();
  }
}
