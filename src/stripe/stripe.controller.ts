import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('checkout')
  createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.stripeService.createCheckoutSession(dto);
  }

  // FRONTEND calls this after success redirect
  @Post('verify')
  verify(@Body('session_id') sessionId: string) {
    return this.stripeService.verifyCheckoutSession(sessionId);
  }

  // WEBHOOK (must be RAW BODY)
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new Error('Webhook Raw Body missing. Enable raw body in main.ts');
    }

    return this.stripeService.handleWebhook(signature, req.rawBody);
  }
}
