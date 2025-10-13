import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';

@Module({
  controllers: [UserRolesController],
  providers: [UserRolesService, PrismaService],
})
export class UserRolesModule {}
