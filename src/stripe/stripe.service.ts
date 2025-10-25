// src/stripe/stripe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async checkoutSuccess(sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    let session;
    try {
      session = await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw new BadRequestException('Unable to retrieve session.');
    }

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment not completed.');
    }

    const tontineId = session.metadata?.tontine_id;
    const userId = session.metadata?.user_id;

    if (!tontineId || !userId) {
      throw new BadRequestException('Missing required metadata.');
    }

    // Find tontine and member
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: Number(tontineId) },
      include: { members: true },
    });

    if (!tontine) throw new BadRequestException('Tontine not found.');

    const member = tontine.members.find((m) => m.userId === Number(userId));
    if (!member) throw new BadRequestException('User is not a tontine member.');

    // Create contribution
    const contribution = await this.prisma.tontineContribution.create({
      data: {
        tontineId: tontine.id,
        userId: Number(userId),
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? 'usd',
        status: 'paid',
        roundNumber: tontine.currentRound,
        contributionDate: new Date(),
      },
    });

    // Optionally update tontine total pot
    await this.prisma.tontine.update({
      where: { id: tontine.id },
      data: {
        totalPot: tontine.totalPot + contribution.amount,
      },
    });

    return {
      message: 'Checkout successful',
      session,
      contribution,
    };
  }

  async checkoutCancel() {
    return {
      message: 'Checkout cancelled',
      status: 'cancelled',
    };
  }
}
