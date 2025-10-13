import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineContributionDto } from './dto/create-tontine-contribution.dto';
import { UpdateTontineContributionDto } from './dto/update-tontine-contribution.dto';

@Injectable()
export class TontineContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTontineContributionDto) {
    return this.prisma.tontineContribution.create({ data: dto });
  }

   async findAll(query: any) {
    const where: any = {};

    if (query.tontineId) where.tontineId = Number(query.tontineId);
    if (query.userId) where.userId = Number(query.userId);
    if (query.amount) where.amount = Number(query.amount);
    if (query.currency) where.currency = query.currency;
    if (query.status) where.status = query.status;
    if (query.roundNumber) where.roundNumber = Number(query.roundNumber);
    if (query.transactionId) where.transactionId = query.transactionId;
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

    return this.prisma.tontineContribution.findMany({
      where,
      include: { user: true, tontine: true },
    });
  }

  async findOne(id: number) {
    const contribution = await this.prisma.tontineContribution.findUnique({
      where: { id },
      include: { user: true, tontine: true },
    });
    if (!contribution) throw new NotFoundException('Contribution not found');
    return contribution;
  }

  async update(id: number, dto: UpdateTontineContributionDto) {
    await this.findOne(id); // throws if not found
    return this.prisma.tontineContribution.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // throws if not found
    return this.prisma.tontineContribution.delete({ where: { id } });
  }
}
