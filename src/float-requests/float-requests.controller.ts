import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { FloatRequestsService } from './float-requests.service';
import { CreateFloatRequestDto } from './dto/create-float-request.dto';
import { UpdateFloatRequestDto } from './dto/update-float-request.dto';

@Controller('float-requests')
export class FloatRequestsController {
  constructor(private readonly service: FloatRequestsService) {}

  @Post()
  create(@Body() dto: CreateFloatRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('agentId') agentId?: number, @Query('status') status?: string) {
    return this.service.findAll({ agentId, status });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFloatRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
