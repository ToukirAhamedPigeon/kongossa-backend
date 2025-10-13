import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { QRPaymentsService } from './qr-payments.service';
import { CreateQRPaymentDto } from './dto/create-qr-payment.dto';
import { UpdateQRPaymentDto } from './dto/update-qr-payment.dto';

@Controller('qr-payments')
export class QRPaymentsController {
  constructor(private readonly qrPaymentsService: QRPaymentsService) {}

  @Post()
  create(@Body() createDto: CreateQRPaymentDto) {
    return this.qrPaymentsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.qrPaymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.qrPaymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateQRPaymentDto) {
    return this.qrPaymentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.qrPaymentsService.remove(id);
  }
}
