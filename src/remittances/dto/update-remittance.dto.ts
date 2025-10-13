import { PartialType } from '@nestjs/mapped-types';
import { CreateRemittanceDto } from './create-remittance.dto';

export class UpdateRemittanceDto extends PartialType(CreateRemittanceDto) {}
