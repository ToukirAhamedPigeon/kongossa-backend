import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsResponseDto } from './dto/invitations-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getInvitations(@Req() req: RequestWithUser): Promise<InvitationsResponseDto> {
    const invitations = await this.invitationsService.getUserInvitations(req.user.email);
    return { invitations };
  }
}
