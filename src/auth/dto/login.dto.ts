import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email or phone of the user', example: 'user@example.com' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Password for login', example: 'strongPassword123' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'One-time password if using OTP', example: '123456' })
  @IsOptional()
  @IsString()
  otp?: string;

  @ApiPropertyOptional({ description: 'Remember me for long-lived session', example: true })
  @IsOptional()
  rememberMe?: boolean;
}
