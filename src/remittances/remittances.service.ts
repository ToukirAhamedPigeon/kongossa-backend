import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRemittanceDto } from './dto/create-remittance.dto';
import { UpdateRemittanceDto } from './dto/update-remittance.dto';

@Injectable()
export class RemittancesService {
  constructor(private prisma: PrismaService) {}

  async create(createRemittanceDto: CreateRemittanceDto) {
    return this.prisma.remittance.create({
      data: createRemittanceDto,
    });
  }

  async findAll(filters: any) {
    const where: any = {};

    if (filters.agentId) where.agentId = Number(filters.agentId);
    if (filters.status) where.status = filters.status;
    if (filters.transactionId) where.transactionId = filters.transactionId;
    if (filters.sourceCurrency) where.sourceCurrency = filters.sourceCurrency;
    if (filters.destinationCurrency) where.destinationCurrency = filters.destinationCurrency;

    // You can add more optional filters if needed
    return this.prisma.remittance.findMany({
      where,
      include: { agent: true },
    });
  }


  async findOne(id: number) {
    const remittance = await this.prisma.remittance.findUnique({
      where: { id },
      include: { agent: true },
    });
    if (!remittance) throw new NotFoundException('Remittance not found');
    return remittance;
  }

  async update(id: number, updateRemittanceDto: UpdateRemittanceDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.remittance.update({
      where: { id },
      data: updateRemittanceDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // ensure exists
    return this.prisma.remittance.delete({ where: { id } });
  }
}
