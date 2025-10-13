import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Post()
  create(@Body() dto: CreatePaymentMethodDto) {
    const userId = 1; // TODO: Replace with actual user ID from Auth
    return this.service.create(userId, dto);
  }

  @Get()
  findAll(@Query('user_id') userId?: string) {
    // fallback or convert to number
    const id = Number(userId) || 1; // optional: handle missing user ID
    return this.service.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentMethodDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/default')
  setDefault(@Param('id', ParseIntPipe) id: number) {
    const userId = 1; // TODO: Replace with actual user ID from Auth
    return this.service.setDefault(userId, id);
  }
}
