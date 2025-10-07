import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule to access database

@Module({
  imports: [PrismaModule], // Import PrismaModule for database access
  providers: [RolesService], // Register the RolesService
  controllers: [RolesController], // Register the RolesController
  exports: [RolesService], // Export RolesService if needed in other modules
})
export class RolesModule {}
