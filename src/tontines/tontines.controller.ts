// src/tontines/tontines.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query,UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { TontinesService } from './tontines.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMembersDto } from './dto/add-member.dto';
import { CreateTontineInviteDto } from './dto/create-invite.dto';
import { TontineStatsDto } from './dto/tontine-stats.dto';
import { TontineDashboardDto } from './dto/tontine-dashboard.dto';
import { TontineTypeOptions } from './tontine-type.enum';

@Controller('tontines')
@UseGuards(JwtAuthGuard)
export class TontinesController {
  constructor(private readonly tontinesService: TontinesService) {}

  // -------------------
  // CRUD
  // -------------------
  @Post()
  async create(@Body() dto: CreateTontineDto, @Req() req: any) {
    const creatorId = req.user.userId; 
    return this.tontinesService.createTontine(dto, creatorId);
  }

  @Get('types')
  getTontineTypes() {
    return {
      tontineTypes: TontineTypeOptions,
    };
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query() filters?: any
  ) {
    const user = req.user;
    return this.tontinesService.findAll(filters, Number(page) || 1, Number(limit) || 20, user.userId);
  }

  @Get('create')
  createForm() {
    // For UI forms (optional in API)
    return { message: 'Tontine create form data' };
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    return this.tontinesService.findOne(id, userId);
  }

  @Get(':id/edit')
  editForm(@Param('id', ParseIntPipe) id: number) {
    // For UI forms (optional in API)
    return { message: 'Tontine edit form data', tontineId: id };
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTontineDto: UpdateTontineDto) {
    return this.tontinesService.update(id, updateTontineDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tontinesService.remove(id);
  }

  // -------------------
  // Stats & Dashboard
  // -------------------
  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number): Promise<TontineStatsDto> {
    return this.tontinesService.getStats(id);
  }

  @Get(':id/dashboard')
  getDashboard(@Param('id', ParseIntPipe) id: number): Promise<TontineDashboardDto> {
    return this.tontinesService.getDashboard(id);
  }

  // -------------------
  // Members & Invites
  // -------------------
  @Post(':id/members')
  addMembers(@Param('id', ParseIntPipe) id: number, @Body() addMembersDto: AddMembersDto) {
    return this.tontinesService.addMembers(id, addMembersDto);
  }

  @Post(':id/invites')
  createInvite(@Param('id', ParseIntPipe) id: number, @Body() createInviteDto: CreateTontineInviteDto) {
    return this.tontinesService.createInvite(id, createInviteDto);
  }

  @Post(':id/invites/:inviteId/approve')
  approveInvite(@Param('id', ParseIntPipe) id: number, @Param('inviteId', ParseIntPipe) inviteId: number) {
    return this.tontinesService.approveInvite(id, inviteId);
  }

  @Post(':id/members/:memberId/remove')
  removeMember(@Param('id', ParseIntPipe) id: number, @Param('memberId', ParseIntPipe) memberId: number) {
    return this.tontinesService.removeMember(id, memberId);
  }

  // -------------------
  // Contributions
  // -------------------
  @Get(':id/contribute')
  tontineContribute(@Param('id', ParseIntPipe) id: number) {
    return this.tontinesService.tontineContribute(id);
  }

  @Post(':id/contribute')
  makeContribution(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: string,
    @Req() req: any
  ) {
    return this.tontinesService.makeContribution(id, req.user.id, amount, paymentMethod);
  }

  // -------------------
  // Payouts
  // -------------------
  @Post(':id/payouts/:memberId')
  payoutMember(@Param('id', ParseIntPipe) id: number, @Param('memberId', ParseIntPipe) memberId: number) {
    return this.tontinesService.payoutMember(id, memberId);
  }
}
