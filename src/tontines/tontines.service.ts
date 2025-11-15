import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMembersDto } from './dto/add-member.dto';
import { CreateTontineInviteDto } from './dto/create-invite.dto';
import { TontineStatsDto } from './dto/tontine-stats.dto';
import { TontineDashboardDto } from './dto/tontine-dashboard.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class TontinesService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  // -------------------
  // CRUD
  // -------------------
  async createTontine(dto: CreateTontineDto, creatorId: number) {
    try {
      // -----------------------------------------
      // 1️⃣ Create Tontine
      // -----------------------------------------
      const tontine = await this.prisma.tontine.create({
        data: {
          name: dto.name,
          type: dto.type,
          frequency: dto.contributionFrequency,
          contributionAmount: dto.contributionAmount,
          durationMonths: dto.durationMonths || 12,
          startDate: new Date(),
          status: 'forming',
          createdBy: creatorId,
          totalPot: new Decimal(0),
          coAdmins: {
            connect: dto.coAdminIds?.map((id) => ({ id })) || [],
          },
        },
      });

      // -----------------------------------------
      // 2️⃣ Create Stripe Price (one-time or recurring)
      // -----------------------------------------
      const isRecurring =
        dto.contributionFrequency === 'monthly' ||
        dto.contributionFrequency === 'weekly';

      const stripeMetadata: Record<string, string> = {
        tontine_id: String(tontine.id),
        creator_id: String(creatorId),
        frequency: dto.contributionFrequency,
      };

      // Use public getter 'client' on StripeService
      let price: Stripe.Price;
      const stripeClient = this.stripeService.client;

      if (isRecurring) {
        price = await stripeClient.prices.create({
          currency: 'usd',
          unit_amount: Math.round(Number(dto.contributionAmount) * 100),
          recurring: {
            interval: dto.contributionFrequency === 'monthly' ? 'month' : 'week',
          },
          product_data: {
            name: `${dto.name} Tontine Contribution`,
          },
          metadata: stripeMetadata,
        });
      } else {
        price = await stripeClient.prices.create({
          currency: 'usd',
          unit_amount: Math.round(Number(dto.contributionAmount) * 100),
          product_data: {
            name: `${dto.name} Tontine Contribution`,
          },
          metadata: stripeMetadata,
        });
      }

      // -----------------------------------------
      // 3️⃣ Save stripePriceId into the tontine
      // -----------------------------------------
      await this.prisma.tontine.update({
        where: { id: tontine.id },
        data: { stripePriceId: price.id },
      });

      // -----------------------------------------
      // 4️⃣ Creator becomes first member
      // -----------------------------------------
      await this.prisma.tontineMember.create({
        data: {
          tontineId: tontine.id,
          userId: creatorId,
          isAdmin: true,
          priorityOrder: 1,
        },
      });

      const memberRecord = await this.prisma.tontineMember.findUnique({
        where: {
          tontineId_userId: { tontineId: tontine.id, userId: creatorId }
        },
        select: { isAdmin: true }
      });

      // -----------------------------------------
      // 5️⃣ Return full tontine with relations
      // -----------------------------------------
      const finalTontine = await this.prisma.tontine.findUnique({
        where: { id: tontine.id },
        include: {
          creator: true,
          members: {
            include: {
              user: true,
              contributions: true,
            },
          },
          coAdmins: true,
          invites: true,
          payouts: true,
        },
      });
      return {
        ...finalTontine,
        isAdmin: memberRecord?.isAdmin ?? false,
      }
    } catch (err) {
      console.error('❌ Failed to create tontine:', err);
      throw new BadRequestException('Failed to create tontine');
    }
  }

  async findAll(filters: any = {}, page = 1, limit = 20, userId?: number) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.type && filters.type !== 'all') {
      where.type = filters.type;
    }

    if (userId) {
      where.createdBy = userId;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tontine.findMany({
        where,
        include: {
          creator: { select: { id: true, fullName: true } },
          coAdmins: true,
          members: {
            include: {
              user: { select: { id: true, fullName: true } },
              contributions: true
            }
          },
          invites: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),

      this.prisma.tontine.count({ where }),
    ]);

    // Add isAdmin to each tontine
    const dataWithAdmin = await Promise.all(
      items.map(async (t) => {
        const memberRecord = await this.prisma.tontineMember.findUnique({
          where: { tontineId_userId: { tontineId: t.id, userId: userId || 0 } },
          select: { isAdmin: true },
        });

        return {
          ...t,
          isAdmin: memberRecord?.isAdmin ?? false,
        };
      })
    );

    return {
      data: dataWithAdmin,
      current_page: page,
      last_page: Math.ceil(total / limit),
      per_page: limit,
      total,
    };
  }


async findOne(id: number, userId?: number) {
  const tontine = await this.prisma.tontine.findUnique({
    where: { id },
    include: {
      creator: true,
      coAdmins: true,
      members: {
        include: {
          user: true,
          contributions: true,
          payouts: true,
        },
      },
      invites: true,
      payouts: true,
    },
  });

  if (!tontine) throw new NotFoundException('Tontine not found');

  // Compute total contributions for each member
  const membersWithTotals = tontine.members.map((member) => {
    const total_contributed = member.contributions.reduce(
      (sum, c) => sum + Number(c.amount || 0),
      0
    );

    const pending_contributions = member.contributions
      .filter(c => c.status !== 'completed')
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const totalContributionAmount = total_contributed;

    return {
      ...member,
      total_contributed,
      pending_contributions,
      totalContributionAmount,
      tontine, // ✅ include the full tontine object here
    };
  });

  // Compute recent contributions (latest 5)
  const allContributions = membersWithTotals.flatMap(m => m.contributions);
  const recent_contributions = allContributions
    .sort((a, b) => (b.contributionDate?.getTime() || 0) - (a.contributionDate?.getTime() || 0))
    .slice(0, 5);

  // Compute upcoming payouts (next 5)
  const upcoming_payouts = tontine.payouts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => a.payoutDate.getTime() - b.payoutDate.getTime())
    .slice(0, 5);

  // Compute stats
  const total_contributed = allContributions.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0
  );
  const total_paid_out = tontine.payouts.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const completion_percentage =
    tontine.durationMonths && tontine.durationMonths > 0
      ? (tontine.members.length / tontine.durationMonths) * 100
      : 0;

  // Detect admin
  const memberRecord = userId
    ? membersWithTotals.find(m => m.userId === userId)
    : null;
  const isAdmin = memberRecord?.isAdmin ?? false;

  return {
    ...tontine,
    members: membersWithTotals, // now each member contains tontine
    recent_contributions,
    upcoming_payouts,
    stats: {
      total_contributed,
      total_paid_out,
      completion_percentage,
      next_payout_date: upcoming_payouts[0]?.payoutDate || null,
      cycles_completed: 0, // compute based on your logic
      total_cycles: tontine.durationMonths,
    },
    isAdmin,
  };
}




  async update(id: number, dto: UpdateTontineDto) {
      const data: any = {};

      if (dto.name !== undefined) data.name = dto.name;
      if (dto.tontine_type_id !== undefined) data.type = dto.tontine_type_id;
      if (dto.amount !== undefined) data.contributionAmount = dto.amount;
      if (dto.cycle !== undefined) data.frequency = dto.cycle;
      if (dto.duration_months !== undefined) data.durationMonths = dto.duration_months;

      return this.prisma.tontine.update({
        where: { id },
        data,
      });
    }


  async remove(id: number) {
    return this.prisma.tontine.delete({ where: { id } });
  }

  // -------------------
  // Stats
  // -------------------
  async getStats(id: number): Promise<TontineStatsDto> {
    const tontine = await this.findOne(id);
    const totalMembers = tontine.members.length;
    const allContributions = tontine.members.flatMap((m) => m.contributions || []);
    const totalContributions = allContributions.reduce(
      (sum, c) => sum + (c.amount instanceof Decimal ? c.amount.toNumber() : Number(c.amount ?? 0)),
      0,
    );
    return {
      totalMembers,
      totalContributions,
      totalPot: allContributions.reduce(
        (sum, c) => sum + (c.amount instanceof Decimal ? c.amount.toNumber() : Number(c.amount ?? 0)),
        0,
      ),
      currentRound: 1,
    };
  }

  async getDashboard(id: number): Promise<TontineDashboardDto> {
    const tontine = await this.findOne(id);
    const allContributions = tontine.members.flatMap((m) => m.contributions || []);
    return {
      myTontines: [tontine],
      myContributions: allContributions,
    };
  }

  // -------------------
  // Members & Invites
  // -------------------
  async addMembers(id: number, dto: AddMembersDto) {
    const createData = dto.userIds.map((userId) => ({
      tontineId: id,
      userId,
      isAdmin: false,
    }));
    return this.prisma.tontineMember.createMany({ data: createData, skipDuplicates: true });
  }

  async removeMember(tontineId: number, memberId: number) {
    const member = await this.prisma.tontineMember.findFirst({
      where: { tontineId, userId: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.tontineMember.delete({ where: { id: member.id } });
  }

  async createInvite(tontineId: number, dto: CreateTontineInviteDto) {
    // 1️⃣ Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2️⃣ If user does not exist, return message
    if (!user) {
      return { success: false, message: 'Email is not registered yet' };
    }

    // 3️⃣ Generate invite token
    const inviteToken = Math.random().toString(36).substring(2, 12);

    // 4️⃣ Create TontineInvite with userId
    const invite = await this.prisma.tontineInvite.create({
      data: {
        tontineId,
        email: dto.email,
        userId: user.id,   // associate existing user
        inviteToken,
        status: 'pending',
      },
    });

    return { success: true, invite };
  }


  async approveInvite(id: number, inviteId: number) {
    const invite = await this.prisma.tontineInvite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.tontineId !== id) throw new NotFoundException('Invite not found');
    if (!invite.userId) throw new BadRequestException('No associated user');
    await this.prisma.tontineMember.create({
      data: { tontineId: id, userId: invite.userId, isAdmin: false },
    });
    return this.prisma.tontineInvite.update({
      where: { id: inviteId },
      data: { status: 'approved' },
    });
  }

  // -------------------
  // Contributions
  // -------------------
  async tontineContribute(id: number) {
    const tontine = await this.findOne(id);
    return {
      tontineId: id,
      name: tontine.name,
      contributionAmount:
        tontine.contributionAmount instanceof Decimal
          ? tontine.contributionAmount.toNumber()
          : tontine.contributionAmount,
      frequency: tontine.frequency,
    };
  }

  async makeContribution(id: number, userId: number, amount: number, paymentMethod: string) {
    const tontine = await this.findOne(id);
    const member = tontine.members[0];
    if (!member) throw new NotFoundException('No members exist in the tontine');

    return this.prisma.tontineContribution.create({
      data: {
        tontineMemberId: member.id,
        amount,
        contributionDate: new Date(),
        status: 'completed',
        userId,
      },
    });
  }

  // -------------------
  // Payouts
  // -------------------
  async payoutMember(tontineId: number, memberId: number) {
    const member = await this.prisma.tontineMember.findFirst({
      where: { tontineId, userId: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    const tontine = await this.findOne(tontineId);
    const contributionAmount =
      tontine.contributionAmount instanceof Decimal
        ? tontine.contributionAmount.toNumber()
        : tontine.contributionAmount;
    const payoutAmount = contributionAmount * tontine.members.length;

    return this.prisma.tontinePayout.create({
      data: {
        tontineId,
        tontineMemberId: member.id,
        amount: payoutAmount,
        payoutDate: new Date(),
        status: 'paid',
      },
    });
  }
}
