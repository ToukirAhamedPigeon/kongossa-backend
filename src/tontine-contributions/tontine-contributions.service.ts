import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineContributionDto } from './dto/create-tontine-contribution.dto';
import { UpdateTontineContributionDto } from './dto/update-tontine-contribution.dto';

@Injectable()
export class TontineContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTontineContributionDto) {
    return this.prisma.tontineContribution.create({
      data: {
        ...dto,
        status: dto.status ?? 'pending', // default to 'pending'
      },
    });
  }

  async findAll(query: any) {
    const where: any = {};
    if (query.tontineId) where.tontineId = Number(query.tontineId);
    if (query.userId) where.userId = Number(query.userId);
    if (query.status) where.status = query.status;

    return this.prisma.tontineContribution.findMany({
      where,
      include: {
        user: true,
        tontineMember: {
          include: { tontine: true }
        }
      },
    });
  }

  async findOne(id: number) {
    const contribution = await this.prisma.tontineContribution.findUnique({
      where: { id },
      include: {
        user: true,
        tontineMember: {
          include: { tontine: true }
        }
      }
    });
    if (!contribution) throw new NotFoundException('Contribution not found');
    return contribution;
  }

  async update(id: number, dto: UpdateTontineContributionDto) {
    await this.findOne(id);
    return this.prisma.tontineContribution.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tontineContribution.delete({ where: { id } });
  }

  async markAsPaid(id: number) {
    return this.update(id, { status: 'paid' });
  }

  async markAsLate(id: number) {
    return this.update(id, { status: 'late' });
  }

  async stats(tontineId: number) {
    return this.prisma.tontineContribution.aggregate({
      where: { tontineMember: { tontineId } },
      _sum: { amount: true },
      _count: { id: true },
    });
  }
  
   async findByTontine(tontineId: number, query: any) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
    });
    if (!tontine) throw new NotFoundException('Tontine not found');

    const where: any = { tontineMember: { tontineId } };
    if (query.userId) where.userId = Number(query.userId);
    if (query.status) where.status = query.status;

    return this.prisma.tontineContribution.findMany({
      where,
      include: {
        user: true,
        tontineMember: { include: { tontine: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
