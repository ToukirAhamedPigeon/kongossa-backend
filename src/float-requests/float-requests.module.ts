import { Module } from '@nestjs/common';
import { FloatRequestsService } from './float-requests.service';
import { FloatRequestsController } from './float-requests.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FloatRequestsController],
  providers: [FloatRequestsService, PrismaService],
})
export class FloatRequestsModule {}
