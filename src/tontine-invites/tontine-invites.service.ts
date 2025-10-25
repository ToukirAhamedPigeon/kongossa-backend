import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TontineInvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tontineInvite.findMany({
      include: { tontine: true, user: true },
    });
  }

  async findOne(id: number) {
    const invite = await this.prisma.tontineInvite.findUnique({
      where: { id },
      include: { tontine: true, user: true },
    });
    if (!invite) throw new NotFoundException('Invite not found');
    return invite;
  }

  async accept(id: number, userId: number) {
    const invite = await this.findOne(id);

    await this.prisma.tontineMember.create({
      data: {
        tontineId: invite.tontineId,
        userId,
        role: 'member',
        isActive: true,
      },
    });

    return this.prisma.tontineInvite.update({
      where: { id },
      data: { status: 'accepted' },
    });
  }

  async decline(id: number) {
    await this.findOne(id);
    return this.prisma.tontineInvite.update({
      where: { id },
      data: { status: 'declined' },
    });
  }

  async resend(id: number) {
    const invite = await this.findOne(id);
    // TODO: trigger email/SMS notification here
    return { message: 'Invite resent successfully', invite };
  }
}
