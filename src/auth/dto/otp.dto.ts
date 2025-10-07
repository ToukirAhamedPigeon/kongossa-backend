import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code?: string; // Optional: only needed when verifying OTP

  @IsString()
  @IsNotEmpty()
  purpose: string; // e.g., 'login', 'register', 'reset-password'
}
