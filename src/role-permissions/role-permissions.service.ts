import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateRolePermissionDto) {
    return this.prisma.rolePermission.create({
      data: {
        roleId: data.roleId,
        permissionId: data.permissionId,
      },
    });
  }

  async findAll() {
    return this.prisma.rolePermission.findMany({
      include: { role: true, permission: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.rolePermission.findUnique({
      where: { id },
      include: { role: true, permission: true },
    });
  }

  async update(id: number, data: UpdateRolePermissionDto) {
    return this.prisma.rolePermission.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.rolePermission.delete({
      where: { id },
    });
  }
}
