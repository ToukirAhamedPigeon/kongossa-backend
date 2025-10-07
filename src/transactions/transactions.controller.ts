import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Controller to handle HTTP requests for transactions.
 * Handles routing, validation, and calls the service layer.
 */
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Create a new transaction
   */
  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  /**
   * Get all transactions
   */
  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }

  /**
   * Get a specific transaction by ID
   * @param id - Transaction ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  /**
   * Update a transaction
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateTransactionDto>,
  ) {
    return this.transactionsService.update(id, data);
  }

  /**
   * Delete a transaction
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }
}
