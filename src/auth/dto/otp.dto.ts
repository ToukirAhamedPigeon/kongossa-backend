import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OtpDto {
  @ApiProperty({ description: 'User email for OTP', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'OTP code for verification', example: '123456' })
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiProperty({ description: 'Purpose of OTP (login, register, reset-password)', example: 'login' })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiPropertyOptional({ description: 'Remember me option for long-lived session', example: true })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
