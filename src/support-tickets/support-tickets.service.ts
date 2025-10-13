import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { SupportTicketQueryDto } from './dto/support-ticket-query.dto';

@Injectable()
export class SupportTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        ...dto,
        status: dto.status || 'open',
      },
    });
  }

  async findAll(query: SupportTicketQueryDto) {
    const filters: any = {};

    if (query.user_id) filters.userId = query.user_id;
    if (query.status) filters.status = query.status;
    if (query.assigned_to) filters.assignedToId = query.assigned_to;
    if (query.priority) filters.priority = query.priority;
    if (query.category) filters.category = query.category;

    return this.prisma.supportTicket.findMany({
      where: filters,
      include: {
        user: true,
        assignedTo: true,
      },
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: true,
        assignedTo: true,
      },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  async update(id: number, dto: UpdateSupportTicketDto) {
    await this.findOne(id);
    return this.prisma.supportTicket.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.supportTicket.delete({ where: { id } });
  }
}
