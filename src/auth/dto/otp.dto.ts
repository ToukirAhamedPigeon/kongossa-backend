import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class OtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code?: string; // Optional: only needed when verifying OTP

  @IsString()
  @IsNotEmpty()
  purpose: string; // e.g., 'login', 'register', 'reset-password'

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean; // Optional: for 30-day token
}
