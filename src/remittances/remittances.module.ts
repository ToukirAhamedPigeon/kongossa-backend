import { Module } from '@nestjs/common';
import { RemittancesService } from './remittances.service';
import { RemittancesController } from './remittances.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RemittancesController],
  providers: [RemittancesService, PrismaService],
})
export class RemittancesModule {}
