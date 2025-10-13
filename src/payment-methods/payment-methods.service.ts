import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: { ...dto, userId },
    });
  }

  async findAll(userId: number) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
    });
  }

  async findOne(id: number) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!paymentMethod) throw new NotFoundException('Payment method not found');
    return paymentMethod;
  }

  async update(id: number, dto: UpdatePaymentMethodDto) {
    const paymentMethod = await this.findOne(id);
    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  // Optionally, set default payment method
  async setDefault(userId: number, id: number) {
    await this.prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
