import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secret) throw new Error('STRIPE_SECRET_KEY missing in .env');

    this.stripe = new Stripe(secret, {
      apiVersion: '2025-10-29.clover',
    });
  }

  // Public getter so other services may use the SDK safely
  get client(): Stripe {
    return this.stripe;
  }

  // ---------------------------------------------
  // 1️⃣ Create Checkout Session
  // ---------------------------------------------
  async createCheckoutSession(dto: {
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],

      line_items: [
        {
          price_data: {
            currency: dto.currency ?? 'usd',
            product_data: {
              name: dto.description || 'Payment',
            },
            unit_amount: Math.round(dto.amount * 100),
          },
          quantity: 1,
        },
      ],

      mode: 'payment',

      success_url: `${this.config.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/payment/cancel`,

      metadata: dto.metadata || {},
    });

    return { url: session.url, id: session.id };
  }

  // ---------------------------------------------
  // 2️⃣ Verify Session on frontend redirect
  // ---------------------------------------------
  async verifyCheckoutSession(sessionId: string) {
    if (!sessionId) throw new BadRequestException('Session ID is required');
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session;
  }

  // ---------------------------------------------
  // 3️⃣ Webhook Handler
  // ---------------------------------------------
  async handleWebhook(sig: string, body: Buffer) {
    let event: Stripe.Event;

    try {
      const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET missing in .env');

      event = this.stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature invalid: ${err?.message ?? err}`);
    }

    this.logger.log(`Received event: ${event.type}`);

    // Only process checkout.session.completed for now
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};

      // Tontine payment
      if (metadata.tontine_id && metadata.user_id) {
        await this.handleTontinePayment(session);
      }

      // Subscription / other flows - placeholder
      if (metadata.subscription) {
        await this.handleSubscriptionPayment(session);
      }
    }

    return { received: true };
  }

  // --------------------------------------------------
  // 4️⃣ Handle Tontine Payment Logic
  // --------------------------------------------------
  private async handleTontinePayment(session: Stripe.Checkout.Session) {
    const tontineId = Number(session.metadata?.tontine_id ?? 0);
    const userId = Number(session.metadata?.user_id ?? 0);
    const amount = (session.amount_total ?? 0) / 100;

    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
      include: { members: true },
    });

    if (!tontine) {
      this.logger.warn(`Tontine ${tontineId} not found for session ${session.id}`);
      throw new BadRequestException('Tontine not found');
    }

    // Find member
    const member = tontine.members.find((m) => m.userId === userId);
    if (!member) {
      this.logger.warn(`User ${userId} is not a member of tontine ${tontineId}`);
      throw new BadRequestException('User is not a tontine member');
    }

    // Create contribution
    const contribution = await this.prisma.tontineContribution.create({
      data: {
        tontineMemberId: member.id,
        userId,
        amount,
        status: 'paid',
        contributionDate: new Date(),
      },
    });

    // Update tontine pot (convert Decimal -> number then add)
    const currentPot =
      typeof (tontine.totalPot as any)?.toNumber === 'function'
        ? (tontine.totalPot as any).toNumber()
        : Number(tontine.totalPot ?? 0);

    await this.prisma.tontine.update({
      where: { id: tontineId },
      data: {
        totalPot: currentPot + amount,
      },
    });

    this.logger.log(`Tontine payment recorded: ${contribution.id} (tontine ${tontineId})`);
  }

  // --------------------------------------------------
  // 5️⃣ Handle Subscription Payment
  // --------------------------------------------------
  private async handleSubscriptionPayment(session: Stripe.Checkout.Session) {
    this.logger.log('Subscription payment processing (placeholder)');
    // Extend later (create subscription rows, user subscriptions, etc.)
  }
}
