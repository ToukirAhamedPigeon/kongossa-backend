import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';


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
   async create(createUserDto: CreateUserDto, legalFormFile?: Express.Multer.File) {
    try {
      const { email, phoneNumber, password, role = 'user' } = createUserDto;

      // Check for existing email or phone
      const existing = await this.prisma.user.findFirst({
        where: { OR: [{ email }, { phoneNumber }] },
      });
      if (existing) {
        throw new BadRequestException('Email or phone number already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate unique referral code
      const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now()}`;

      // Generate QR code
      const uniqueData = `KONGOSSA_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const qrCode = await QRCode.toDataURL(uniqueData);

      // Legal form document path
      const legalFormDocumentPath = legalFormFile ? `uploads/legal_docs/${legalFormFile.filename}` : null;

      // Create user
      const user = await this.prisma.user.create({
        data: {
          fullName: createUserDto.fullName,
          email,
          phoneNumber,
          passwordHash,
          role: role || 'user',
          accountType: createUserDto.accountType || 'personal',
          country: createUserDto.country || '',
          profileImage: createUserDto.profileImage || '',
          referralCode, // ✅ Now always unique
          address: createUserDto.address || '',
          dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : new Date(),
          qrCode,
          companyName: createUserDto.companyName || null,
          legalForm: createUserDto.legalForm || null,
          managerName: createUserDto.managerName || null,
          companyPhone: createUserDto.companyPhone || null,
          companyAddress: createUserDto.companyAddress || null,
          businessDescription: createUserDto.businessDescription || null,
          legalFormDocument: legalFormDocumentPath,
        },
      });

      // Link user role
      const roleRecord = await this.prisma.role.findUnique({ where: { name: user.role } });
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: roleRecord?.id || 2, // default to user
        },
      });

      // Set transaction limits
      await this.prisma.transactionLimits.create({
        data: {
          userId: user.id,
          daily: 1000,
          weeklyBudget: 5000,
          monthlyBudget: 20000,
          yearlyBudget: 240000,
        },
      });

      return {
        message: `User created successfully as ${user.role}`,
        userId: user.id,
        email: user.email,
        referralCode: user.referralCode,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find all users
   */
  async findAll(page = 1, perPage = 10, search?: string) {
    const skip = (page - 1) * perPage;
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { phoneNumber: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
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
  async update(id: number, data: any) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    const { role, password, legalFormDocument, ...updateData } = data;

    // Hash password if changed
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Handle legal form document replacement
    if (legalFormDocument && existing.legalFormDocument) {
      try {
        const oldFilePath = path.join(process.cwd(), existing.legalFormDocument.replace('/uploads', 'uploads'));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.error('Failed to remove old legal document:', err);
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        legalFormDocument: legalFormDocument || existing.legalFormDocument,
      },
    });

    // Handle role update
    if (role) {
      const existingRole = await this.prisma.role.findUnique({ where: { name: role } });
      if (existingRole) {
        await this.prisma.userRole.upsert({
          where: { userId_roleId: { userId: id, roleId: existingRole.id } },
          create: { userId: id, roleId: existingRole.id },
          update: {},
        });
      }
    }

    // Return user with role
    const userWithRole = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    return {
      ...userWithRole,
      role: userWithRole?.userRoles?.[0]?.role?.name,
    };
  }

  /**
   * Delete a user by ID
   */
  async remove(id: number) {
  try {
    await this.findOne(id); // ensure user exists

    // Delete dependent records first
    await this.prisma.transactionLimits.deleteMany({ where: { userId: id } });
    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    // await this.prisma.wallet?.deleteMany?.({ where: { userId: id } }); // optional if wallet table exists
    await this.prisma.transaction?.deleteMany?.({ where: { senderId: id } }); // optional if transactions exist

    // Now delete the user
    return await this.prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new BadRequestException(error.message);
  }
}

  /**
   * Find a user by email (used in login/auth)
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  getLegalFormDocumentPath(documentPath: string): string {
    // Remove leading slash
    const relativePath = documentPath.startsWith('/')
      ? documentPath.slice(1)
      : documentPath;

    // Resolve absolute path
    const fullPath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File does not exist at path: ${fullPath}`);
    }

    return fullPath;
  }


  async getStats() {
    const [total_users, active_users, inactive_users, total_roles] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'active' } }),
      this.prisma.user.count({ where: { status: 'inactive' } }),
      this.prisma.role.count(),
    ]);

    return { total_users, active_users, inactive_users, total_roles };
  }

  async getRoles() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
