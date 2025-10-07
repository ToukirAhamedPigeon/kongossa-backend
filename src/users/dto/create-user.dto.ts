import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO for creating a new user
 * This defines the validation rules for incoming requests
 */
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  role: string = 'user';

  @IsOptional()
  @IsString()
  accountType: string = 'personal';

  @IsOptional()
  @IsString()
  country: string = 'France';

  @IsOptional()
  @IsString()
  profileImage: string = '';

  @IsOptional()
  @IsString()
  referralCode: string = '';

  // ⚡ Add missing required fields
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  qrCode: string;
}

