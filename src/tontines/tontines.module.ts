import { Module } from '@nestjs/common';
import { TontinesService } from './tontines.service';
import { TontinesController } from './tontines.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TontinesController],
  providers: [TontinesService, PrismaService],
})
export class TontinesModule {}
