import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQRPaymentDto } from './dto/create-qr-payment.dto';
import { UpdateQRPaymentDto } from './dto/update-qr-payment.dto';

@Injectable()
export class QRPaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateQRPaymentDto) {
    return this.prisma.qRPayment.create({
      data: createDto,
    });
  }

  async findAll(query?: {
    qrCode?: string;
    recipientId?: number;
    amount?: number;
    currency?: string;
    description?: string;
    isActive?: boolean;
    expiryDate?: Date;
    usageLimit?: number;
    usageCount?: number;
    paymentType?: string;
  }) {
    const filters: any = {};
    
    if (query?.qrCode) filters.qrCode = query.qrCode;
    if (query?.recipientId) filters.recipientId = query.recipientId;
    if (query?.amount) filters.amount = query.amount;
    if (query?.currency) filters.currency = query.currency;
    if (query?.description) filters.description = query.description;
    if (query?.isActive !== undefined) filters.isActive = query.isActive;
    if (query?.expiryDate) filters.expiryDate = query.expiryDate;
    if (query?.usageLimit) filters.usageLimit = query.usageLimit;
    if (query?.usageCount) filters.usageCount = query.usageCount;
    if (query?.paymentType) filters.paymentType = query.paymentType;

    return this.prisma.qRPayment.findMany({
      where: filters,
      include: { recipient: true },
    });
  }

  async findOne(id: number) {
    const qr = await this.prisma.qRPayment.findUnique({
      where: { id },
      include: { recipient: true },
    });
    if (!qr) throw new NotFoundException('QR Payment not found');
    return qr;
  }

  async update(id: number, updateDto: UpdateQRPaymentDto) {
    await this.findOne(id); // ensures existence
    return this.prisma.qRPayment.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // ensures existence
    return this.prisma.qRPayment.delete({ where: { id } });
  }
}
