import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RemittancesService } from './remittances.service';
import { CreateRemittanceDto } from './dto/create-remittance.dto';
import { UpdateRemittanceDto } from './dto/update-remittance.dto';

@Controller('remittances')
export class RemittancesController {
  constructor(private readonly remittancesService: RemittancesService) {}

  @Post()
  create(@Body() createRemittanceDto: CreateRemittanceDto) {
    return this.remittancesService.create(createRemittanceDto);
  }

  @Get()
  findAll() {
    return this.remittancesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.remittancesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRemittanceDto: UpdateRemittanceDto) {
    return this.remittancesService.update(+id, updateRemittanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.remittancesService.remove(+id);
  }
}
