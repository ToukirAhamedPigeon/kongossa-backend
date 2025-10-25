import { IsString, MinLength } from 'class-validator';

export class ConfirmPasswordDto {
  @IsString()
  @MinLength(6)
  password: string;
}
