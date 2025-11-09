// dto/update-role.dto.ts
import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: number[];
}
