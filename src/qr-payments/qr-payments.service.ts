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

  async findAll() {
    return this.prisma.qRPayment.findMany({
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
