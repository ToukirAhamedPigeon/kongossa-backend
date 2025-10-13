import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordResetsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new Error('User not found');

    const token = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(token, 10);

    const reset = await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hash,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });

    // send token to email (implementation omitted)
    return { message: 'Password reset token created', token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const reset = await this.prisma.passwordReset.findFirst({
      where: { used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!reset) throw new Error('Invalid or expired token');

    const isValid = await bcrypt.compare(dto.token, reset.token);
    if (!isValid) throw new Error('Invalid token');

    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });

    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    });

    return { message: 'Password reset successfully' };
  }
}
