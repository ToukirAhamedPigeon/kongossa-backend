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

  
  @IsOptional()
  @IsString()
  status?: string;

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
