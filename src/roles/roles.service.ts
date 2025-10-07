import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new role
   * @param data Role data { name, description }
   */
  async createRole(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data,
    });
  }

  /**
   * Get all roles
   */
  async getAllRoles() {
    return this.prisma.role.findMany();
  }

  /**
   * Get a role by ID
   * @param id Role ID
   */
  async getRoleById(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  /**
   * Update a role by ID
   * @param id Role ID
   * @param data Role data to update
   */
  async updateRole(id: number, data: Prisma.RoleUpdateInput) {
    // Check if role exists
    await this.getRoleById(id);

    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a role by ID
   * @param id Role ID
   */
  async deleteRole(id: number) {
    // Check if role exists
    await this.getRoleById(id);

    return this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * Assign role to a user
   * @param userId User ID
   * @param roleId Role ID
   */
  async assignRoleToUser(userId: number, roleId: number) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  /**
   * Remove role from a user
   * @param userId User ID
   * @param roleId Role ID
   */
  async removeRoleFromUser(userId: number, roleId: number) {
    return this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  /**
   * Get roles of a user
   * @param userId User ID
   */
  async getUserRoles(userId: number) {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return roles.map((r) => r.role);
  }
}
