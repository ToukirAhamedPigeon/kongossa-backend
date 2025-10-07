import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Prisma } from '@prisma/client';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Create a new role
   * POST /roles
   */
  @Post()
  async createRole(@Body() data: Prisma.RoleCreateInput) {
    return this.rolesService.createRole(data);
  }

  /**
   * Get all roles
   * GET /roles
   */
  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  /**
   * Get role by ID
   * GET /roles/:id
   */
  @Get(':id')
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleById(id);
  }

  /**
   * Update a role
   * PATCH /roles/:id
   */
  @Patch(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.RoleUpdateInput,
  ) {
    return this.rolesService.updateRole(id, data);
  }

  /**
   * Delete a role
   * DELETE /roles/:id
   */
  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deleteRole(id);
  }

  /**
   * Assign a role to a user
   * POST /roles/assign
   */
  @Post('assign')
  async assignRoleToUser(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }

  /**
   * Remove a role from a user
   * POST /roles/remove
   */
  @Post('remove')
  async removeRoleFromUser(
    @Body('userId') userId: number,
    @Body('roleId') roleId: number,
  ) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  /**
   * Get all roles of a user
   * GET /roles/user/:userId
   */
  @Get('user/:userId')
  async getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.rolesService.getUserRoles(userId);
  }
}
