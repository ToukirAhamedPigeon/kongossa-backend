import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty() @IsString() fullName: string;
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @IsString() phoneNumber: string;
  @IsNotEmpty() @IsString() password: string;

  @IsOptional() @IsString() role: string = 'user';
  @IsOptional() @IsString() accountType: string = 'personal';

  // Business fields
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() legalForm?: string;
  @IsOptional() @IsString() managerName?: string;
  @IsOptional() @IsString() companyPhone?: string;
  @IsOptional() @IsString() companyAddress?: string;
  @IsOptional() @IsString() businessDescription?: string;

  // File path of uploaded document
  @IsOptional() @IsString() legalFormDocument?: string | null;

  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() profileImage?: string;
  @IsOptional() @IsString() referralCode?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() dateOfBirth?: Date;
  @IsOptional() @IsString() qrCode?: string;
}
