import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionDto) {
    return this.prisma.permission.create({ data });
  }

  async findAll() {
    return this.prisma.permission.findMany();
  }

  async findOne(id: number) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdatePermissionDto) {
    return this.prisma.permission.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
