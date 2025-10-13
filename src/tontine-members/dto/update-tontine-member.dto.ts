import { PartialType } from '@nestjs/mapped-types';
import { CreateTontineMemberDto } from './create-tontine-member.dto';

export class UpdateTontineMemberDto extends PartialType(CreateTontineMemberDto) {}
