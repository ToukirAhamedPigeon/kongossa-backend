import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    return this.prisma.userRole.create({
      data: {
        userId: createUserRoleDto.userId,
        roleId: createUserRoleDto.roleId,
      },
    });
  }

  async findAll() {
    return this.prisma.userRole.findMany({
      include: {
        user: true,
        role: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.userRole.findUnique({
      where: { id },
      include: { user: true, role: true },
    });
  }

  async update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    return this.prisma.userRole.update({
      where: { id },
      data: {
        userId: updateUserRoleDto.userId,
        roleId: updateUserRoleDto.roleId,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.userRole.delete({
      where: { id },
    });
  }
}
