import { IsEmail, IsOptional } from 'class-validator';

export class CreateTontineInviteDto {
  @IsEmail()
  email: string;

  @IsOptional()
  role?: string; // optional member role
}
