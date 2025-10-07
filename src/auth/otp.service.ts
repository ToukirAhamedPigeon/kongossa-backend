import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  // Sends OTP to user email
  async sendOtp(email: string, purpose: string) {
    const code = randomInt(100000, 999999).toString(); // 6-digit OTP
    const codeHash = await bcrypt.hash(code, 12); // hash OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP in DB
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    await this.prisma.otp.create({
      data: {
        email,
        codeHash,
        purpose,
        expiresAt,
        userId: user.id,
      },
    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${code}. It expires in 10 minutes.`,
    });

    return { message: 'OTP sent successfully' };
  }
}
