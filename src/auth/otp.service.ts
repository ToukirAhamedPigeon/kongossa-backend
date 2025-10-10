import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService, // inject MailService
  ) {}

  // Send OTP
  // Send OTP (for first time or resend)
  async sendOtp(email: string, purpose: string) {
    try{
      console.log(email, purpose);
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('User not found');

      // Revoke previous OTPs
      await this.prisma.otp.updateMany({
        where: { email, purpose, used: false },
        data: { used: true },
      });

      // Generate new OTP
      const code = randomInt(100000, 999999).toString();
      const codeHash = await bcrypt.hash(code, 12);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      const otpRecord = await this.prisma.otp.create({
        data: { email, codeHash, purpose, expiresAt, userId: user.id },
      });

      await this.mailService.sendMail(
        email,
        'Your OTP Code',
        `Your OTP code is ${code}. It will expire in 10 minutes.`
      );

      return { message: 'OTP resent successfully', otpToken: code };
    }
    catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  // Verify OTP
  async verifyOtp(email: string, code: string, purpose: string) {
    const otpRecord = await this.prisma.otp.findFirst({
      where: { email, purpose, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!otpRecord) throw new Error('OTP not found');
    if (otpRecord.expiresAt < new Date()) throw new Error('OTP expired');

    const valid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!valid) throw new Error('Invalid OTP');

    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    return { message: 'OTP verified successfully' };
  }
}
