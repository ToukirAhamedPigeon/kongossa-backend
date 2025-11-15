import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';

export class UpdateTontineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tontine_type_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsEnum(["weekly", "monthly"])
  cycle?: "weekly" | "monthly";

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_months?: number;
}
