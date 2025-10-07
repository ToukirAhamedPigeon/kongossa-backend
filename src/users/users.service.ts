import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * UsersService handles all user-related database operations
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   * Hashes password before saving
   */
  async create(createUserDto: CreateUserDto) {
    const { email, phoneNumber, password } = createUserDto;

    // Check if email or phone already exists
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
    if (existing) throw new BadRequestException('Email or phone number already exists');

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
        data: {
            fullName: createUserDto.fullName,
            email: createUserDto.email,
            phoneNumber: createUserDto.phoneNumber,
            passwordHash: hashedPassword,
            role: createUserDto.role,
            accountType: createUserDto.accountType,
            country: createUserDto.country,
            profileImage: createUserDto.profileImage,
            referralCode: createUserDto.referralCode,
            address: createUserDto.address,
            dateOfBirth: createUserDto.dateOfBirth,
            qrCode: createUserDto.qrCode,
        },
    });
  }

  /**
   * Find all users
   */
  async findAll() {
    return this.prisma.user.findMany();
  }

  /**
   * Find one user by ID
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update a user by ID
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // If password is updated, hash it
    if (updateUserDto.password) {
        const hashed = await bcrypt.hash(updateUserDto.password, 12);
        delete updateUserDto.password;
        updateUserDto['passwordHash'] = hashed; // Map manually
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  /**
   * Delete a user by ID
   */
  async remove(id: number) {
    await this.findOne(id); // throws if not found
    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * Find a user by email (used in login/auth)
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
