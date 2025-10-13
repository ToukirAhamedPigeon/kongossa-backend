import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async sendOtp(data: SendOtpDto) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    return this.prisma.otp.create({
      data: {
        email: data.email,
        purpose: data.purpose,
        codeHash,
        userId: data.userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
      },
    });
  }

  async verifyOtp(data: VerifyOtpDto) {
    const otp = await this.prisma.otp.findFirst({
      where: { email: data.email, purpose: data.purpose, used: false },
    });

    if (!otp) throw new Error('OTP not found or already used');

    const isValid = await bcrypt.compare(data.code, otp.codeHash);
    if (!isValid) throw new Error('Invalid OTP');

    // mark as used
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return { success: true };
  }
}
