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

  async findAll(filters: any) {
    const where: any = {};

    if (filters.agent_id) where.agentId = Number(filters.agent_id);
    if (filters.contact_type) where.contactType = filters.contact_type;
    if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
    if (filters.phone) where.phone = { contains: filters.phone };
    if (filters.country) where.country = filters.country;
    if (filters.bank_name) where.bankName = { contains: filters.bank_name, mode: 'insensitive' };
    if (filters.account_number) where.accountNumber = filters.account_number;

    return this.prisma.savedContact.findMany({
      where,
      include: { agent: true },
    });
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
