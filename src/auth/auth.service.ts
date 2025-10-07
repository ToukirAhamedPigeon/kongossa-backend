import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService, // Prisma ORM service
    private readonly jwtService: JwtService, // JWT handling
  ) {}

  // Registers a new user and returns JWT tokens
  async register(userData: any) {
    const hash = await bcrypt.hash(userData.password, 12); // hash password
    const user = await this.prisma.user.create({
      data: { ...userData, passwordHash: hash },
    });
    return this.getTokens(user); // return JWT tokens
  }

  // User login
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.getTokens(user); // return JWT tokens
  }

  // Generates access and refresh tokens
  async getTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    });

    // Refresh token (long-lived)
    const refreshTokenRaw = randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 12);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken: refreshTokenRaw };
  }

  // Verifies a refresh token
  async verifyRefreshToken(token: string) {
    const tokenDb = await this.prisma.refreshToken.findFirst({
      where: { revoked: false },
    });
    if (!tokenDb) throw new UnauthorizedException('Invalid token');

    const valid = await bcrypt.compare(token, tokenDb.tokenHash);
    if (!valid) throw new UnauthorizedException('Invalid token');

    return tokenDb.userId;
  }
  async googleLogin(profile: any) {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Check if user exists
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: name,
          passwordHash: '', // Google login doesn't use password
          role: 'user',     // default role
          phoneNumber: '',  // optional, can be updated later
          walletBalance: 0,
          currency: 'USD',
          referralCode: '', // generate if needed
          qrCode: '',       // generate if needed
          address: '',
          country: '',
          dateOfBirth: new Date(), // default, update later
          profileImage: profile.photos[0]?.value || '',
        },
      });
    }

    // Return JWT access & refresh tokens
    return this.getTokens(user);
  }
}
