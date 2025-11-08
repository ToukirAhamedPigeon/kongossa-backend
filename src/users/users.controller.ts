import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, NotFoundException, Res, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResource } from './dto/user-resource.dto';
import { paginate } from '../common/utils/pagination';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';



/**
 * UsersController defines HTTP endpoints for user CRUD
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

   @Post()
    @UseInterceptors(
      FileInterceptor('legalFormDocument', {
        storage: diskStorage({
          destination: './uploads/legal_docs',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      }),
    )
    async create(
      @UploadedFile() legalFormDocument: Express.Multer.File,
      @Body() body: any,
    ) {
      // Convert body fields manually because Nest doesn’t parse multipart strings automatically
      try{
        const createUserDto: CreateUserDto = {
          fullName: body.fullName,
          email: body.email,
          phoneNumber: body.phoneNumber,
          password: body.password,
          role: body.role || 'user',
          accountType: body.accountType || 'personal',
          companyName: body.companyName || null,
          legalForm: body.legalForm || null,
          managerName: body.managerName || null,
          companyPhone: body.companyPhone || null,
          companyAddress: body.companyAddress || null,
          businessDescription: body.businessDescription || null,
          legalFormDocument: legalFormDocument
            ? `uploads/legal_docs/${legalFormDocument.filename}`
            : null,
        };
        console.log(createUserDto);
        return this.usersService.create(createUserDto);
      }
      catch (error) {
        return { error: error.message };
      }
    }

  @Get()
  async index(@Query('page') page = 1, @Query('per_page') perPage = 10, @Query('search') search?: string) {
    const { users, total } = await this.usersService.findAll(Number(page), Number(perPage), search);
    const stats = await this.usersService.getStats();
    const roles = await this.usersService.getRoles();

    const pagination = paginate(total, Number(page), Number(perPage));

    return {
      users: UserResource.collection(users),
      pagination,
      roles,
      stats,
    };
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('legalFormDocument', {
      storage: diskStorage({
        destination: './uploads/legal_docs',
        filename: (req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateUserDto.legalFormDocument = `/uploads/legal_docs/${file.filename}`;
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try{
      console.log('Deleting user with ID:', id);
      return await this.usersService.remove(id);
    }
    catch (error) {
      console.error('Error deleting user:', error);
      return { error: error.message };
    }
  }

 @Get(':id/download-document')
  async downloadLegalFormDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const user = await this.usersService.findOne(id);

    if (!user.legalFormDocument) {
      throw new NotFoundException('No document uploaded for this user');
    }

    const filePath = path.join(process.cwd(), 'uploads', 'legal_docs', path.basename(user.legalFormDocument));

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const fileExt = path.extname(filePath);
    const downloadName = `${user.fullName.replace(/\s+/g, '_')}_legal_form${fileExt}`;

    return res.download(filePath, downloadName); // works for any file type
  }
}
