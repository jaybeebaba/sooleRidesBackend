import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';

@Injectable()
export class PassengersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateMe(userId: string, dto: UpdatePassengerProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        updatedAt: true,
      },
    });
  }
}