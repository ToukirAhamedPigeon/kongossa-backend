import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TontineInvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tontineInvite.findMany({
      where: { status: 'pending' },
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

  async accept(id: number, userId?: number) {
    const invite = await this.findOne(id);

    // Use passed userId or invite.userId if available
    const finalUserId = userId ?? invite.userId;
    if (!finalUserId) throw new Error("User ID is required to accept invite");

    await this.prisma.tontineMember.create({
      data: {
        tontineId: invite.tontineId,
        userId: finalUserId,
        isAdmin: false,
      },
    });

    return this.prisma.tontineInvite.update({
      where: { id },
      data: { status: "accepted" },
    });
  }

  async decline(id: number) {
    try{
      await this.findOne(id);
      return this.prisma.tontineInvite.update({
        where: { id },
        data: { status: 'declined' },
      });
    }catch(error){
      console.log(error);
      throw new NotFoundException('Invite not found');
    }
  }

  async resend(id: number) {
    const invite = await this.findOne(id);
    // TODO: trigger email/SMS notification here
    return { message: 'Invite resent successfully', invite };
  }

  // 🔹 Remove a Tontine invite
  async remove(id: number) {
    const invite = await this.findOne(id);
    await this.prisma.tontineInvite.delete({
      where: { id: invite.id },
    });
  }
}
