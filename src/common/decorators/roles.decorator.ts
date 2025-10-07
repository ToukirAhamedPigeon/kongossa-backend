import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator for role-based authorization.
 * Usage:
 * @Roles('admin', 'editor')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
