import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { TontineContributionsService } from './tontine-contributions.service';
import { CreateTontineContributionDto } from './dto/create-tontine-contribution.dto';
import { UpdateTontineContributionDto } from './dto/update-tontine-contribution.dto';

@Controller('tontine-contributions')
export class TontineContributionsController {
  constructor(private readonly service: TontineContributionsService) {}

  @Post()
  create(@Body() dto: CreateTontineContributionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query); // Delegate filtering to the service
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTontineContributionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('stats/tontine/:tontineId')
  stats(@Param('tontineId', ParseIntPipe) tontineId: number) {
    return this.service.stats(tontineId);
  }

  @Patch(':id/mark-paid')
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsPaid(id);
  }

  @Patch(':id/mark-late')
  markAsLate(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsLate(id);
  }

  @Get('tontine/:id')
  findByTontine(
      @Param('id', ParseIntPipe) tontineId: number,
      @Query() query: any,
    ) {
      return this.service.findByTontine(tontineId, query);
    }

}
