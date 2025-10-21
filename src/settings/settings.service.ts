import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /settings/profile
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profileImage: true,
        address: true,
        country: true,
        emailVerifiedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // PATCH /settings/profile
  async updateProfile(userId: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updatedData: any = {
      fullName: data.fullName ?? user.fullName,
      phoneNumber: data.phoneNumber ?? user.phoneNumber,
      address: data.address ?? user.address,
      country: data.country ?? user.country,
      profileImage: data.profileImage ?? user.profileImage,
    };

    // If email is updated, reset verification
    if (data.email && data.email !== user.email) {
      updatedData.email = data.email;
      updatedData.emailVerifiedAt = null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    return { message: 'Profile updated successfully', user: updatedUser };
  }

  // DELETE /settings/profile
  async deleteAccount(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException('Incorrect password');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted successfully' };
  }

  // PUT /settings/password
  async updatePassword(
    userId: number,
    current_password: string,
    new_password: string,
    password_confirmation: string,
  ) {
    if (new_password !== password_confirmation)
      throw new BadRequestException('Password confirmation does not match');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(current_password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await bcrypt.hash(new_password, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Password updated successfully' };
  }
}
