import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedContactDto } from './dto/create-saved-contact.dto';
import { UpdateSavedContactDto } from './dto/update-saved-contact.dto';

@Injectable()
export class SavedContactsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSavedContactDto) {
    return this.prisma.savedContact.create({ data: dto });
  }

  async findAll() {
    return this.prisma.savedContact.findMany({ include: { agent: true } });
  }

  async findOne(id: number) {
    return this.prisma.savedContact.findUnique({ where: { id }, include: { agent: true } });
  }

  async update(id: number, dto: UpdateSavedContactDto) {
    return this.prisma.savedContact.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.savedContact.delete({ where: { id } });
  }
}
