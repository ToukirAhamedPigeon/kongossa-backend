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

  async findAll() {
    return this.prisma.tontine.findMany({
      include: {
        creator: true,
        coAdmin: true,
        members: true,
        contributions: true,
      },
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
