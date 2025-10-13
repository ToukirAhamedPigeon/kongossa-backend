import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
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
  findAll() {
    return this.service.findAll();
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
}
