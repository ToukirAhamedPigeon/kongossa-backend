import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvitationDto } from './dto/invitations-response.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserInvitations(userEmail: string): Promise<InvitationDto[]> {
    const invites = await this.prisma.tontineInvite.findMany({
      where: {
        email: userEmail,
        status: 'PENDING', // match your StatusEnums::PENDING
      },
      include: {
        tontine: true,
      },
    });

    return invites.map(invite => ({
      id: invite.id,
      email: invite.email,
      status: invite.status,
      createdAt: invite.createdAt,
      tontine: {
        id: invite.tontine.id,
        name: invite.tontine.name,
        type: invite.tontine.type,
        contributionAmount: invite.tontine.contributionAmount,
        frequency: invite.tontine.contributionFrequency,
      },
    }));
  }
}
