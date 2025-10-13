import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFloatRequestDto } from './dto/create-float-request.dto';
import { UpdateFloatRequestDto } from './dto/update-float-request.dto';

@Injectable()
export class FloatRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFloatRequestDto) {
    return this.prisma.floatRequest.create({
      data: createDto,
    });
  }

  async findAll(filters?: { agentId?: number; status?: string }) {
    return this.prisma.floatRequest.findMany({
      where: {
        ...(filters?.agentId && { agentId: Number(filters.agentId) }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { agent: true },
    });
  }

  async findOne(id: number) {
    const floatRequest = await this.prisma.floatRequest.findUnique({
      where: { id },
      include: { agent: true },
    });
    if (!floatRequest) throw new NotFoundException('FloatRequest not found');
    return floatRequest;
  }

  async update(id: number, updateDto: UpdateFloatRequestDto) {
    await this.findOne(id); // throws if not found
    return this.prisma.floatRequest.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // throws if not found
    return this.prisma.floatRequest.delete({
      where: { id },
    });
  }
}
