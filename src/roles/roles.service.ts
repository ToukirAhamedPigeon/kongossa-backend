import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new role
   * @param data Role data { name, description }
   */
  async createRole(data: { name: string; description?: string; permissions?: number[] }) {
    try {
      const { name, description, permissions = [] } = data;

      // Create the role and connect permissions
      const role = await this.prisma.role.create({
        data: {
          name,
          description,
          rolePermissions: {
            create: permissions.map((permissionId) => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          },
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles() {
    // Fetch roles with permissions and count of users
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: true, // to count users per role
      },
    });

    // Map to a cleaner structure for frontend
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      total_users: role.userRoles.length, // count of users with this role
      permissions: role.rolePermissions.map((rp) => rp.permission), // list of permission objects
    }));
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
   * @param data Role data to update { name?, description?, permissions? }
   */
  async updateRole(id: number, data: UpdateRoleDto) {
    try {
      const { name, description, permissions } = data;

      // Ensure role exists
      const role = await this.prisma.role.findUnique({ where: { id } });
      if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

      // Step 1: Update name/description
      const updatedRole = await this.prisma.role.update({
        where: { id },
        data: { name, description },
      });

      // Step 2: If permissions array is provided, reset and reattach
      if (permissions && Array.isArray(permissions)) {
        // Remove all old rolePermissions
        await this.prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new ones
        await this.prisma.rolePermission.createMany({
          data: permissions.map((pid) => ({
            roleId: id,
            permissionId: pid,
          })),
        });
      }

      // Step 3: Return updated role with permissions
      return this.prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
          userRoles: true,
        },
      });
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete a role by ID
   * @param id Role ID
   */
  async deleteRole(id: number) {
  // Ensure the role exists first
  await this.getRoleById(id);

  // Delete all relations atomically
  await this.prisma.$transaction([
    // Remove RolePermission records
    this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    }),
    // Remove UserRole records
    this.prisma.userRole.deleteMany({
      where: { roleId: id },
    }),
    // Finally remove the Role itself
    this.prisma.role.delete({
      where: { id },
    }),
  ]);

  return { message: `Role with ID ${id} deleted successfully` };
}

  /**
   * Assign role to a user
   * @param userId User ID
   * @param roleId Role ID
   */
  async assignRoleToUser(userId: number, roleId: number) {
  // Create the userRole record
  const userRole = await this.prisma.userRole.create({
    data: { userId, roleId },
  });

  // Fetch the role name
  const role = await this.prisma.role.findUnique({ where: { id: roleId } });

  if (role) {
    // Update the user's main 'role' column
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: role.name },
    });
  }

  return userRole;
}

async removeRoleFromUser(userId: number, roleId: number) {
  // Remove the userRole record
  await this.prisma.userRole.deleteMany({
    where: { userId, roleId },
  });

  // Fetch remaining roles for the user
  const remainingRoles = await this.prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  // Update user's main 'role' column
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      role: remainingRoles.length > 0 ? remainingRoles[0].role.name : '', // empty if no roles left
    },
  });

  return { success: true };
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
