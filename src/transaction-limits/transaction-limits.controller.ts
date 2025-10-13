// src/transaction-limits/transaction-limits.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { TransactionLimitsService } from './transaction-limits.service';
import {CreateTransactionLimitDto} from './dto/create-transaction-limit.dto';
import {UpdateTransactionLimitDto} from './dto/update-transaction-limit.dto';

@Controller('transaction-limits')
export class TransactionLimitsController {
  constructor(private readonly service: TransactionLimitsService) {}

  @Post()
  create(@Body() dto: CreateTransactionLimitDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionLimitDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
