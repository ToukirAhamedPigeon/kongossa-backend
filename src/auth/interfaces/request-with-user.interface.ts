import { User } from '@prisma/client'; // ✅ Prisma User model
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: User;
}