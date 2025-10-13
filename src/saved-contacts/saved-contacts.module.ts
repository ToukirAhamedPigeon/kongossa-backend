import { Module } from '@nestjs/common';
import { SavedContactsService } from './saved-contacts.service';
import { SavedContactsController } from './saved-contacts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SavedContactsController],
  providers: [SavedContactsService, PrismaService],
})
export class SavedContactsModule {}
