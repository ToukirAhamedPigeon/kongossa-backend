import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineMemberDto } from './dto/create-tontine-member.dto';
import { UpdateTontineMemberDto } from './dto/update-tontine-member.dto';

@Injectable()
export class TontineMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTontineMemberDto) {
    return this.prisma.tontineMember.create({ data: dto });
  }

  async findAll() {
    return this.prisma.tontineMember.findMany({ include: { user: true, tontine: true } });
  }

  async findOne(id: number) {
    const member = await this.prisma.tontineMember.findUnique({ 
      where: { id },
      include: { user: true, tontine: true }
    });
    if (!member) throw new NotFoundException('Tontine Member not found');
    return member;
  }

  async update(id: number, dto: UpdateTontineMemberDto) {
    await this.findOne(id);
    return this.prisma.tontineMember.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tontineMember.delete({ where: { id } });
  }

  async stats(id: number) {
    // Example: aggregate contributions
    const contributions = await this.prisma.tontineContribution.aggregate({
      where: { userId: id },
      _sum: { amount: true },
      _count: { id: true },
    });
    return contributions;
  }
  async addContribution(memberId: number, amount: number) {
    const member = await this.findOne(memberId);
    return this.prisma.tontineContribution.create({
      data: {
        tontineId: member.tontineId,
        userId: member.userId,
        amount,
        roundNumber: 1
      },
    });
  }
}
