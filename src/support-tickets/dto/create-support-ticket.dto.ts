import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  priority?: string; // default 'medium'

  @IsInt()
  @IsOptional()
  assignedToId?: number;
}
