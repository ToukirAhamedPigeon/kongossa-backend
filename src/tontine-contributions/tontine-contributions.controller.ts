import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, Req } from '@nestjs/common';
import { TontineContributionsService } from './tontine-contributions.service';
import { CreateTontineContributionDto } from './dto/create-tontine-contribution.dto';
import { UpdateTontineContributionDto } from './dto/update-tontine-contribution.dto';

@Controller('tontine-contributions')
export class TontineContributionsController {
  constructor(private readonly service: TontineContributionsService) {}

  @Post()
  create(@Body() dto: CreateTontineContributionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query); // Delegate filtering to the service
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTontineContributionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('stats/tontine/:tontineId')
  stats(@Param('tontineId', ParseIntPipe) tontineId: number) {
    return this.service.stats(tontineId);
  }

  @Patch(':id/mark-paid')
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsPaid(id);
  }

  @Patch(':id/mark-late')
  markAsLate(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsLate(id);
  }

  @Get('tontine/:id')
  findByTontine(
      @Param('id', ParseIntPipe) tontineId: number,
      @Query() query: any,
    ) {
      return this.service.findByTontine(tontineId, query);
    }

 @Get('checkout/success')
  async handleSuccess(@Query('sessionId') sessionId: string) {
    try{
    if (!sessionId) {
      return { success: false, message: 'No session ID provided' };
    }

    // Retrieve Stripe session
    const session = await this.service.retrieveStripeSession(sessionId);
    if (!session) {
      return { success: false, message: 'Stripe session not found' };
    }

    // Get data from metadata
    const tontineId = Number(session.metadata?.tontine_id ?? 0);
    const userId = Number(session.metadata?.user_id ?? 0);
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (!tontineId || !userId) {
      return { success: false, message: 'Invalid metadata' };
    }

    // Create contribution
    const contribution = await this.service.createContributionFromStripe({
      tontineId,
      userId,
      amount,
      status: 'completed',
      paymentMethod: 'stripe',
    });

    return {
      success: true,
      contributionId: contribution.id,
      redirectTo: '/tontine-contributions',
    };
  }
  catch (error) {
    console.error('Error in handleSuccess:', error);
    return { success: false, message: error.message };
  }
}

  @Get('checkout/cancel')
  handleCancel(@Query('sessionId') sessionId: string) {
    return { success: false, redirectTo: `/tontine-contributions` };
  }

}
