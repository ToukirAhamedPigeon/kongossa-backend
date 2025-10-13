import { PartialType } from '@nestjs/mapped-types';
import { CreateFloatRequestDto } from './create-float-request.dto';

export class UpdateFloatRequestDto extends PartialType(CreateFloatRequestDto) {}
