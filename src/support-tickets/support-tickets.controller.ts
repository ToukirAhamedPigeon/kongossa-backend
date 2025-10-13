import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { SupportTicketQueryDto } from './dto/support-ticket-query.dto';

@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  create(@Body() dto: CreateSupportTicketDto) {
    return this.supportTicketsService.create(dto);
  }

  @Get()
  findAll(@Query() query: SupportTicketQueryDto) {
    return this.supportTicketsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supportTicketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupportTicketDto) {
    return this.supportTicketsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportTicketsService.remove(+id);
  }
}
