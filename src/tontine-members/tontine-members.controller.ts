import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TontineMembersService } from './tontine-members.service';
import { CreateTontineMemberDto } from './dto/create-tontine-member.dto';
import { UpdateTontineMemberDto } from './dto/update-tontine-member.dto';

@Controller('tontine-members')
export class TontineMembersController {
  constructor(private readonly service: TontineMembersService) {}

  @Post()
  create(@Body() dto: CreateTontineMemberDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTontineMemberDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
