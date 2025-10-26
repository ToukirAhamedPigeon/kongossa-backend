import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, NotFoundException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersController defines HTTP endpoints for user CRUD
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

   @Get(':id/download-document')
  async downloadLegalFormDocument(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const user = await this.usersService.findOne(id);

    if (!user.legalFormDocument) {
      throw new NotFoundException('Document not found');
    }

    // Get signed URL or full path
    const url = this.usersService.getLegalFormDocumentUrl(user.legalFormDocument);

    // Redirect to the URL
    return res.redirect(url);
  }
}
