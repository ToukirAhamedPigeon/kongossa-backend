import { Global,Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule
 * This module wraps the PrismaService so it can be injected into other modules.
 * By exporting PrismaService, other modules like AuthModule, UsersModule, etc. can use it.
 */
@Global()
@Module({
  providers: [PrismaService],  // register PrismaService as a provider
  exports: [PrismaService],    // make PrismaService injectable in other modules
})
export class PrismaModule {}
