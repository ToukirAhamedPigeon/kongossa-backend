import { IsInt, IsArray, IsOptional } from 'class-validator';

export class AddMembersDto {
  @IsArray()
  userIds: number[];

  @IsOptional()
  @IsInt()
  role?: number; // optional role
}
