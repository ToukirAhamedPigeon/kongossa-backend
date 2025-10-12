import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // email or phone

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  otp?: string; // optional if using OTP

  @IsOptional()
  rememberMe?: boolean; // optional, for 30-day token
}
