import { Injectable, UnauthorizedException,NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { OtpService } from './otp.service';
import { MailService } from './../mail/mail.service';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  // Registers a new user
  // auth.service.ts
  async register(userData: any) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) throw new UnauthorizedException('Email already registered');

      const userCount = await this.prisma.user.count();

      // If no users exist, reset ID sequence and assign admin role
      if (userCount === 0) {
        await this.prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`);
      }

      const hash = await bcrypt.hash(userData.password, 12);

      const roleName = userCount === 0 ? 'admin' : 'user';
      const role = await this.prisma.role.findUnique({ where: { name: roleName } });
      const uniqueData = `KONGOSSA_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const qrCode = await QRCode.toDataURL(uniqueData);

      // Create user
     const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        fullName: userData.fullName,
        passwordHash: hash,
        role: roleName,
        walletBalance: 0,
        currency: 'USD',
        referralCode: userData.referralCode || null,
        qrCode,
        profileImage: userData.profileImage || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        country: userData.country || '',
        companyName: userData.companyName || null,
        legalForm: userData.legalForm || null,
        managerName: userData.managerName || null,
        companyPhone: userData.companyPhone || null,
        companyAddress: userData.companyAddress || null,
        businessDescription: userData.businessDescription || null,
        legalFormDocument: userData.legalFormDocument || null,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth)
          : new Date(),
      },
    });
      // Link to Role in UserRole table
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role?.id || 2, // Default to 'user' role if not found
        },
      });

      // Auto create transaction limit row (optional)
      await this.prisma.transactionLimits.create({
        data: {
          userId: user.id,
          daily: 1000, // default daily limit
          weeklyBudget: 5000,
          monthlyBudget: 20000,
          yearlyBudget: 240000,
        },
      });

      // Send OTP
      await this.otpService.sendOtp(user.email, 'register');

      return {
        message: `User registered successfully as ${roleName}. OTP sent to email.`,
        otpSent: true,
        email: user.email,
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }
  async login(identifier: string, password: string, rememberMe: boolean = false) {
    // Find user by email OR phone number
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.otpService.sendOtp(user.email, 'login');

    return {
      otp_required: true,
      email: user.email,
      message: 'OTP sent to email',
      rememberMe, // forward for OTP verification
    };
  }

  // Generate tokens after OTP verification
  async generateTokensAfterOtp(email: string, rememberMe: boolean = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const payload = { sub: user.id, email: user.email, role: user.role };
    // console.log(rememberMe);
    const refreshTokenExpiryMs = rememberMe 
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 2 * 24 * 60 * 60 * 1000; // 2 days default
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION as StringValue) || '15m'
    });

    const refreshTokenRaw = randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 12);
    const expiresAt = new Date(Date.now() + refreshTokenExpiryMs);
    // console.log('Refresh token expires at:', expiresAt);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt, 
      },
    });

    // ✅ Fetch roles & permissions properly
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: {
          select: {
            name: true,
            rolePermissions: {
              select: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const roles = userRoles.map((ur) => ur.role.name);
    const permissions = userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map(
        (rp) => rp.permission.action + ':' + rp.permission.resource
      )
    );

    const userInfo = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: roles,
      permissions,
      walletBalance: user.walletBalance,
      currency: user.currency,
    };

    return { accessToken, refreshToken: refreshTokenRaw, refreshTokenExpires: expiresAt, userInfo };
  }

    // Refresh token
    async refreshAccessToken(refreshToken: string) {
      const tokens = await this.prisma.refreshToken.findMany();
      for (const stored of tokens) {
        const valid = await bcrypt.compare(refreshToken, stored.tokenHash);
        if (valid && stored.expiresAt > new Date() && !stored.revoked) {
          const user = await this.prisma.user.findUnique({
            where: { id: stored.userId },
          });
          if (!user) throw new UnauthorizedException('User not found');

          const payload = { sub: user.id, email: user.email, role: user.role };

          const newAccessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: (process.env.JWT_ACCESS_EXPIRATION as StringValue) || '15m'
          });

          const userRoles = await this.prisma.userRole.findMany({
            where: { userId: user.id },
            include: {
              role: {
                select: {
                  name: true,
                  rolePermissions: {
                    select: {
                      permission: true,
                    },
                  },
                },
              },
            },
          });

      const roles = userRoles.map((ur) => ur.role.name);
      const permissions = userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map(
          (rp) => rp.permission.action + ':' + rp.permission.resource
        )
      );

      const userInfo = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: roles,
        permissions,
        walletBalance: user.walletBalance,
        currency: user.currency,
      };

        return { accessToken: newAccessToken, refreshTokenExpires: stored.expiresAt, user:userInfo };
      }
    }
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  async revokeRefreshToken(refreshToken: string) {
    try{
    const tokens = await this.prisma.refreshToken.findMany();
    for (const stored of tokens) {
      const valid = await bcrypt.compare(refreshToken, stored.tokenHash);
      if (valid) {
        await this.prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revoked: true },
        });
        return true;
      }
    }
    return false;
    }
    catch (error) {
      console.log('Revoke refresh token error:', error.message);
      throw new Error(error.message);
    }
  }

  // Generates JWT access & refresh tokens
  async getTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION as StringValue) || '15m'
    });

    const refreshTokenRaw = randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 12);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: refreshTokenRaw };
  }

  // Generate OTP token (used for email verification)
  private async generateOtpToken(user: any) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.otp.create({
      data: {
        email: user.email,
        codeHash,
        purpose: 'register',
        expiresAt,
        userId: user.id,
      },
    });

    return code; // send plain OTP for frontend (or encode in JWT for secure token)
  }

  // Google Login/Registration
  async googleLogin(profile: any) {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: name,
          passwordHash: '', // optional password
          role: 'user',     // default role
          walletBalance: 0,
          currency: 'USD',
          referralCode: '',
          qrCode: '',
          address: '',
          country: '',
          dateOfBirth: new Date(),
          profileImage: profile.photos[0]?.value || '',
          phoneNumber: '',
        },
      });
    }

    return this.getTokens(user);
  }

  async setPassword(userId: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashed },
    });
    return { message: "Password updated successfully" };
  }

  // Initiate password reset (revokes previous links)
    async forgotPassword(email: string, domain: string) {
      try {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new NotFoundException('User with this email not found');

        // Revoke previous unused tokens
        await this.prisma.passwordReset.updateMany({
          where: { userId: user.id, used: false },
          data: { used: true },
        });

        // Generate a new secure token
        const token = randomBytes(32).toString('hex'); // 256-bit
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save new token
        await this.prisma.passwordReset.create({
          data: { userId: user.id, token, expiresAt },
        });

        // Send reset email
        const resetUrl = `${domain}/reset-password?token=${token}`;
        await this.mailService.sendMail(
          user.email,
          'Reset Your Password',
          `Click this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
        );

        return { message: 'Password reset email sent successfully' };
      } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
      }
    }


     // Reset password using token
    async resetPassword(token: string, newPassword: string) {
      try {
        const record = await this.prisma.passwordReset.findUnique({ where: { token } });
        if (!record || record.used) throw new BadRequestException('Invalid or already used token');
        if (record.expiresAt < new Date()) throw new BadRequestException('Token expired');

        const hashed = await bcrypt.hash(newPassword, 12);

        // update user password
        await this.prisma.user.update({
          where: { id: record.userId },
          data: { passwordHash: hashed },
        });

        // mark token as used
        await this.prisma.passwordReset.update({
          where: { id: record.id },
          data: { used: true },
        });

        return { message: 'Password has been reset successfully' };
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    }

    // ✅ New: mark email as verified if not already
    async markEmailVerified(email: string) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException('User not found');
      if (!user.emailVerifiedAt) {
        await this.prisma.user.update({
          where: { email },
          data: { emailVerifiedAt: new Date() },
        });
      }
    }

    // ✅ New: get user by ID
    async getUserById(id: number) {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      return user;
    }

    // ✅ New: confirm email verification via link
    async confirmEmailVerification(userId: number, hash: string) {
      const user = await this.getUserById(userId);
      // Simple hash check: hash = bcrypt hash of email
      const valid = await bcrypt.compare(user.email, hash);
      if (!valid) throw new BadRequestException('Invalid verification link');

      if (!user.emailVerifiedAt) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { emailVerifiedAt: new Date() },
        });
      }

      return { message: 'Email verified successfully' };
    }

    // ✅ New: resend email verification
    async resendEmailVerification(email: string) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new NotFoundException('User not found');
      if (user.emailVerifiedAt) return { message: 'Email already verified' };

      const hash = await bcrypt.hash(user.email, 12);
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${user.id}/${hash}`;

      await this.mailService.sendMail(
        email,
        'Verify Your Email',
        `Click here to verify your email: ${verificationLink}`
      );

      return { message: 'Verification email sent successfully' };
    }

    async confirmPassword(userId: number, password: string) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new UnauthorizedException('User not found');

      const valid = await bcrypt.compare(password, user.passwordHash || '');
      if (!valid) throw new UnauthorizedException('Incorrect password');

      return { message: 'Password confirmed successfully', confirmedAt: new Date() };
    }
  }
