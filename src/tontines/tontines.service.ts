// src/tontines/tontines.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMembersDto } from './dto/add-member.dto';
import { CreateTontineInviteDto } from './dto/create-invite.dto';
import { TontineStatsDto } from './dto/tontine-stats.dto';
import { TontineDashboardDto } from './dto/tontine-dashboard.dto';

@Injectable()
export class TontinesService {
  constructor(private prisma: PrismaService) {}

  // -------------------
  // CRUD
  // -------------------
  async create(createTontineDto: CreateTontineDto) {
    return this.prisma.tontine.create({ data: createTontineDto });
  }

  async findAll(filters: any = {}, page = 1, limit = 20, userId?: number) {
    const where: any = {};

    // 🔍 Add search conditions only if needed
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.type && filters.type!=='all') where.type = filters.type;
    if (userId) where.creatorId = userId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tontine.findMany({
        where,
        include: {
          creator: true,
          coAdmin: true,
          members: { include: { user: true } },
          contributions: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tontine.count({ where }),
    ]);

    return {
      data: items,
      current_page: page,
      last_page: Math.ceil(total / limit),
      per_page: limit,
      total,
    };
  }

  async findOne(id: number) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id },
      include: { creator: true, coAdmin: true, members: true, contributions: true, invites: true },
    });
    if (!tontine) throw new NotFoundException('Tontine not found');
    return tontine;
  }

  async update(id: number, updateTontineDto: UpdateTontineDto) {
    return this.prisma.tontine.update({ where: { id }, data: updateTontineDto });
  }

  async remove(id: number) {
    return this.prisma.tontine.delete({ where: { id } });
  }

  // -------------------
  // Stats & Dashboard
  // -------------------
  async getStats(id: number): Promise<TontineStatsDto> {
    const tontine = await this.findOne(id);
    const totalMembers = tontine.members.length;
    const totalContributions = tontine.contributions.reduce((acc, c) => acc + c.amount, 0);
    return {
      totalMembers,
      totalContributions,
      totalPot: tontine.totalPot,
      currentRound: tontine.currentRound,
    };
  }

  async getDashboard(id: number): Promise<TontineDashboardDto> {
    const tontine = await this.findOne(id);
    return {
      myTontines: [tontine],
      myContributions: tontine.contributions,
    };
  }

  // -------------------
  // Members & Invites
  // -------------------
  async addMembers(id: number, dto: AddMembersDto) {
    const tontine = await this.findOne(id);
    const createData = dto.userIds.map((userId) => ({
      tontineId: id,
      userId,
      role: String(dto.role || 'member'),
    }));
    return this.prisma.tontineMember.createMany({ data: createData, skipDuplicates: true });
  }

  async removeMember(tontineId: number, memberId: number) {
    const member = await this.prisma.tontineMember.findFirst({
      where: { tontineId, userId: memberId },
    });
    if (!member) throw new NotFoundException('Member not found in this tontine');
    return this.prisma.tontineMember.delete({ where: { id: member.id } });
  }

  async createInvite(id: number, dto: CreateTontineInviteDto) {
    const inviteToken = Math.random().toString(36).substring(2, 12);
    return this.prisma.tontineInvite.create({
      data: { tontineId: id, email: dto.email, inviteToken, status: 'pending' },
    });
  }

  async approveInvite(id: number, inviteId: number) {
    const invite = await this.prisma.tontineInvite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.tontineId !== id) throw new NotFoundException('Invite not found');
    if (invite.status !== 'pending') throw new BadRequestException('Invite already processed');

    // Add the invited user as a member if userId exists
    if (!invite.userId) throw new BadRequestException('Invite has no associated user');
    await this.prisma.tontineMember.create({
      data: { tontineId: id, userId: invite.userId, role: 'member' },
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
      contributionAmount: tontine.contributionAmount,
      contributionFrequency: tontine.contributionFrequency,
      paymentMethods: tontine.paymentMethods,
    };
  }

  async makeContribution(id: number, amount: number, paymentMethod: string) {
    const tontine = await this.findOne(id);
    return this.prisma.tontineContribution.create({
      data: {
        tontineId: id,
        userId: 1, // Replace with logged-in user
        amount,
        paymentMethod,
        roundNumber: tontine.currentRound,
        status: 'completed',
        contributionDate: new Date(),
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
    const payoutAmount = tontine.contributionAmount * tontine.members.length; // simple example

    // Record the payout
    return this.prisma.tontinePayout.create({
      data: {
        tontineMemberId: member.id,
        amount: payoutAmount,
        payoutDate: new Date(),
        status: 'paid',
      },
    });
  }
}
