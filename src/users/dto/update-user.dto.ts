import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto allows partial update of User fields.
 * Password is optional but will be hashed in UsersService.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  password?: string; // Only for incoming request
}
