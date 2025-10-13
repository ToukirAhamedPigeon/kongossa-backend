import { IsInt, IsNotEmpty, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  tokenHash: string;

  @IsInt()
  userId: number;

  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsBoolean()
  revoked?: boolean;

  @IsOptional()
  @IsInt()
  replacedById?: number;
}
