import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService
 * Extends PrismaClient and integrates it with NestJS lifecycle events
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  /**
   * onModuleInit
   * Called automatically when the NestJS module is initialized.
   * Connects to the PostgreSQL database.
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to PostgreSQL');
  }

  /**
   * onModuleDestroy
   * Called automatically when the NestJS application is shutting down.
   * Disconnects the PrismaClient cleanly to prevent open handles.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected');
  }
}
