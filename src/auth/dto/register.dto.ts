import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Email address of the user', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the account', example: 'strongPassword123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'Phone number of the user', example: '+8801234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Role of the user', example: 'admin' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ description: 'Company name', example: 'Tech Corp' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Legal form of the company', example: 'LLC' })
  @IsOptional()
  @IsString()
  legalForm?: string;

  @ApiPropertyOptional({ description: 'Manager name', example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiPropertyOptional({ description: 'Company phone number', example: '+8801987654321' })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiPropertyOptional({ description: 'Company address', example: '123 Main Street, City' })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({ description: 'Business description', example: 'Software development and IT consulting' })
  @IsOptional()
  @IsString()
  businessDescription?: string;

  @ApiPropertyOptional({ description: 'Legal form document URL', example: 'https://example.com/docs/legal.pdf' })
  @IsOptional()
  @IsString()
  legalFormDocument?: string;
}
