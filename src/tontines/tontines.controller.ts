// src/tontines/tontines.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TontinesService } from './tontines.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { AddMembersDto } from './dto/add-member.dto';
import { CreateTontineInviteDto } from './dto/create-invite.dto';
import { TontineStatsDto } from './dto/tontine-stats.dto';
import { TontineDashboardDto } from './dto/tontine-dashboard.dto';

@Controller('tontines')
export class TontinesController {
  constructor(private readonly tontinesService: TontinesService) {}

  // -------------------
  // CRUD
  // -------------------
  @Post()
  create(@Body() createTontineDto: CreateTontineDto) {
    return this.tontinesService.create(createTontineDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query() filters?: any) {
    return this.tontinesService.findAll(filters, Number(page) || 1, Number(limit) || 20);
  }

  @Get('create')
  createForm() {
    // For UI forms (optional in API)
    return { message: 'Tontine create form data' };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tontinesService.findOne(id);
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
  makeContribution(@Param('id', ParseIntPipe) id: number, @Body('amount') amount: number, @Body('paymentMethod') paymentMethod: string) {
    return this.tontinesService.makeContribution(id, amount, paymentMethod);
  }

  // -------------------
  // Payouts
  // -------------------
  @Post(':id/payouts/:memberId')
  payoutMember(@Param('id', ParseIntPipe) id: number, @Param('memberId', ParseIntPipe) memberId: number) {
    return this.tontinesService.payoutMember(id, memberId);
  }
}
