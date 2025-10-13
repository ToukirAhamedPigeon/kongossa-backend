import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';

@Injectable()
export class RefreshTokensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateRefreshTokenDto) {
    return this.prisma.refreshToken.create({
      data: {
        tokenHash: createDto.tokenHash,
        userId: createDto.userId,
        expiresAt: createDto.expiresAt,
      },
    });
  }

  async findAll() {
    return this.prisma.refreshToken.findMany();
  }

  async findOne(id: number) {
    return this.prisma.refreshToken.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateData: Partial<CreateRefreshTokenDto>) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.refreshToken.delete({
      where: { id },
    });
  }
}
