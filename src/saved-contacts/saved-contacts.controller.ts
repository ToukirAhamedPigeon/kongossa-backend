import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { SavedContactsService } from './saved-contacts.service';
import { CreateSavedContactDto } from './dto/create-saved-contact.dto';
import { UpdateSavedContactDto } from './dto/update-saved-contact.dto';

@Controller('saved-contacts')
export class SavedContactsController {
  constructor(private readonly service: SavedContactsService) {}

  @Post()
  create(@Body() dto: CreateSavedContactDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSavedContactDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
