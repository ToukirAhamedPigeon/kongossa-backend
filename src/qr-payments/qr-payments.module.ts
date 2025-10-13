import { Module } from '@nestjs/common';
import { QRPaymentsService } from './qr-payments.service';
import { QRPaymentsController } from './qr-payments.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [QRPaymentsController],
  providers: [QRPaymentsService, PrismaService],
})
export class QRPaymentsModule {}
