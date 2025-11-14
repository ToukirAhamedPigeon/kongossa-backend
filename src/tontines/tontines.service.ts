import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMembersDto } from './dto/add-member.dto';
import { CreateTontineInviteDto } from './dto/create-invite.dto';
import { TontineStatsDto } from './dto/tontine-stats.dto';
import { TontineDashboardDto } from './dto/tontine-dashboard.dto';
import { Decimal } from '@prisma/client/runtime/library';



@Injectable()
export class TontinesService {
  constructor(private prisma: PrismaService) {}

  // -------------------
  // CRUD
  // -------------------
  async create(dto: CreateTontineDto, userId: number) {
    try {
      const tontine = await this.prisma.tontine.create({
        data: {
          name: dto.name,
          type: dto.type,
          frequency: dto.contributionFrequency, // schema uses frequency
          contributionAmount: dto.contributionAmount,
          durationMonths: dto.durationMonths || 12,
          startDate: new Date(),
          status: 'forming',
          createdBy: userId,
          coAdmins: { connect: [] },
        },
      });
      return tontine;
    } catch (err) {
      console.error('Error creating tontine:', err);
      throw new BadRequestException('Failed to create tontine');
    }
  }

  async findAll(filters: any = {}, page = 1, limit = 20, userId?: number) {
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status && filters.status !== 'all') where.status = filters.status;
    if (filters.type && filters.type !== 'all') where.type = filters.type;
    if (userId) where.createdBy = userId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tontine.findMany({
        where,
        include: {
          creator: { select: { id: true, fullName: true } },
          coAdmins: true,
          members: { include: { user: { select: { id: true, fullName: true } }, contributions: true } },
          invites: true,
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
      include: {
        creator: true,
        coAdmins: true,
        members: {
          include: { contributions: true }
        },
        invites: true,
      },
    });
    if (!tontine) throw new NotFoundException('Tontine not found');
    return tontine;
  }

  async update(id: number, dto: UpdateTontineDto) {
    return this.prisma.tontine.update({
      where: { id },
      data: {
        ...dto,
        frequency: dto.contributionFrequency,
        contributionAmount: dto.contributionAmount,
      },
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
    const allContributions = tontine.members.flatMap(m => m.contributions);
    const totalContributions = allContributions.reduce(
      (sum, c) => sum + (c.amount instanceof Decimal ? c.amount.toNumber() : c.amount),
      0
    );
    return {
      totalMembers,
      totalContributions,
      totalPot: allContributions.reduce(
        (sum, c) => sum + (c.amount instanceof Decimal ? c.amount.toNumber() : c.amount),
        0,
      ),
      currentRound: 1, // placeholder if your schema has no currentRound
    };
  }

  async getDashboard(id: number): Promise<TontineDashboardDto> {
    const tontine = await this.findOne(id);
    const allContributions = tontine.members.flatMap(m => m.contributions);

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

  async createInvite(id: number, dto: CreateTontineInviteDto) {
    const inviteToken = Math.random().toString(36).substring(2, 12);
    return this.prisma.tontineInvite.create({
      data: { tontineId: id, email: dto.email, inviteToken, status: 'pending' },
    });
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
    return this.prisma.tontineContribution.create({
      data: {
        tontineMemberId: tontine.members[0].id, // you may adjust for real member
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
