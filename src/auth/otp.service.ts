import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async sendOtp(email: string, purpose: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    await this.prisma.otp.updateMany({
      where: { email, purpose, used: false },
      data: { used: true },
    });

    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otp.create({
      data: { email, codeHash, purpose, expiresAt, userId: user.id },
    });

    await this.mailService.sendMail(
      email,
      'Your OTP Code',
      `Your OTP code is ${code}. It will expire in 10 minutes.`
    );

    return { message: 'OTP sent successfully', otpToken: code };
  }

  async verifyOtp(email: string, code: string, purpose: string) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { email, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!otpRecord) throw new Error('OTP not found');
    if (otpRecord.expiresAt < new Date()) throw new Error('OTP expired');

    const valid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!valid) throw new Error('Invalid OTP');

    // Mark the OTP as used
    await this.prisma.otp.update({ where: { id: otpRecord.id }, data: { used: true } });

    // ✅ Verify email if not already verified
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerifiedAt) {
      await this.prisma.user.update({
        where: { email },
        data: { emailVerifiedAt: new Date() },
      });
    }

    return { message: 'OTP verified successfully' };
  }
}

