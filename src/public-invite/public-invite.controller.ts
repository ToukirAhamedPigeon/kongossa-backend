// src/public-invite/public-invite.controller.ts
import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { PublicInviteService } from './public-invite.service';
import { PublicInviteResponseDto } from './dto/public-invite-response.dto';

@Controller('invite')
export class PublicInviteController {
  constructor(private readonly inviteService: PublicInviteService) {}

  @Get(':token')
  async getByToken(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const { invite, hasEmail } = await this.inviteService.getInviteByToken(token);

    if (hasEmail) {
      // Redirect user to login if email exists
      return res.redirect('/login');
    }

    // Return JSON response (or render a template if using frontend framework)
    const response: PublicInviteResponseDto = {
      invitation: invite,
      token,
      hasEmail,
    };

    return res.json(response);
  }
}
