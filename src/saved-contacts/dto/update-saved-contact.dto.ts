import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedContactDto } from './create-saved-contact.dto';

export class UpdateSavedContactDto extends PartialType(CreateSavedContactDto) {}
