import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';

@Injectable()
export class TontinesService {
  constructor(private prisma: PrismaService) {}

  async create(createTontineDto: CreateTontineDto) {
    return this.prisma.tontine.create({
      data: createTontineDto,
    });
  }

  async findAll(filters: any = {}, page = 1, limit = 20) {
    const where: any = {};

    // Apply filters if present
    if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;
    if (filters.creatorId) where.creatorId = Number(filters.creatorId);
    if (filters.coAdminId) where.coAdminId = Number(filters.coAdminId);
    if (filters.inviteCode) where.inviteCode = filters.inviteCode;

    return this.prisma.tontine.findMany({
      where,
      include: {
        creator: true,
        coAdmin: true,
        members: true,
        contributions: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: number) {
    return this.prisma.tontine.findUnique({
      where: { id },
      include: {
        creator: true,
        coAdmin: true,
        members: true,
        contributions: true,
      },
    });
  }

  async update(id: number, updateTontineDto: UpdateTontineDto) {
    return this.prisma.tontine.update({
      where: { id },
      data: updateTontineDto,
    });
  }

  async remove(id: number) {
    return this.prisma.tontine.delete({
      where: { id },
    });
  }
}
