// src/transaction-limits/transaction-limits.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {CreateTransactionLimitDto} from './dto/create-transaction-limit.dto';
import {UpdateTransactionLimitDto} from './dto/update-transaction-limit.dto';

@Injectable()
export class TransactionLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTransactionLimitDto) {
    return this.prisma.transactionLimits.create({ data: dto });
  }

  findAll() {
    return this.prisma.transactionLimits.findMany({ include: { user: true } });
  }

  findOne(id: number) {
    return this.prisma.transactionLimits.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  update(id: number, dto: UpdateTransactionLimitDto) {
    return this.prisma.transactionLimits.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.transactionLimits.delete({ where: { id } });
  }
}
