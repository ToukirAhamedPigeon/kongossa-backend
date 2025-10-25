// src/public-invite/public-invite.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // make sure PrismaService exists

@Injectable()
export class PublicInviteService {
  constructor(private readonly prisma: PrismaService) {}

  async getInviteByToken(token: string) {
    const invite = await this.prisma.tontineInvite.findUnique({
      where: { inviteToken: token },
      include: { tontine: true }, // include related tontine
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    const hasEmail = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });

    return { invite, hasEmail: !!hasEmail };
  }
}
