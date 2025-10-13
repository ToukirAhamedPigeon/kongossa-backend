import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TontinesService } from './tontines.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';

@Controller('tontines')
export class TontinesController {
  constructor(private readonly tontinesService: TontinesService) {}

  @Post()
  create(@Body() createTontineDto: CreateTontineDto) {
    return this.tontinesService.create(createTontineDto);
  }

  @Get()
  findAll() {
    return this.tontinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tontinesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTontineDto: UpdateTontineDto) {
    return this.tontinesService.update(id, updateTontineDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tontinesService.remove(id);
  }
}
