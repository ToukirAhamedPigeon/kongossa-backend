import { IsInt, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTontineMemberDto {
  @IsInt()
  tontineId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
