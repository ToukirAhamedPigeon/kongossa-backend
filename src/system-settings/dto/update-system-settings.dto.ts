import { IsOptional, IsNumber } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsNumber()
  transferFeePercent?: number;

  @IsOptional()
  @IsNumber()
  withdrawalFeeFlat?: number;

  @IsOptional()
  @IsNumber()
  forexMarkupPercent?: number;

  @IsOptional()
  @IsNumber()
  cryptoMarkupPercent?: number;

  @IsOptional()
  @IsNumber()
  tontineFeePercent?: number;
}
