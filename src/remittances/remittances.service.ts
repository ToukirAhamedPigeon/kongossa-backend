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

  async findAll() {
    return this.prisma.remittance.findMany({
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
