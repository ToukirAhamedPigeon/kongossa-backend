import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TontineInvitesService } from './tontine-invites.service';

@Controller('tontine-invites')
export class TontineInvitesController {
  constructor(private readonly service: TontineInvitesService) {}

  // 🔹 Get all invites
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // 🔹 Get a specific invite
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // 🔹 Accept a Tontine invite
  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId') userId: number,
  ) {
    return this.service.accept(id, userId);
  }

  // 🔹 Decline a Tontine invite
  @Patch(':id/decline')
  @HttpCode(HttpStatus.OK)
  async decline(@Param('id', ParseIntPipe) id: number) {
    return this.service.decline(id);
  }

  // 🔹 Resend a Tontine invite
  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  async resend(@Param('id', ParseIntPipe) id: number) {
    return this.service.resend(id);
  }
}
