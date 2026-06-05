import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriverStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyDriverDto } from './dto/apply-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: ApplyDriverDto) {
    const existingProfile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Driver application already exists');
    }

    return this.prisma.driverProfile.create({
      data: {
        userId,
        licenseNumber: dto.licenseNumber,
        bio: dto.bio,
        yearsDriving: dto.yearsDriving,
        status: DriverStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
        licenseNumber: true,
        bio: true,
        yearsDriving: true,
        createdAt: true,
      },
    });
  }

  async getMe(userId: string) {
    const profile = await this.prisma.driverProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        licenseNumber: true,
        bio: true,
        yearsDriving: true,
        createdAt: true,
        updatedAt: true,
        vehicles: {
          select: {
            id: true,
            plateNumber: true,
            brand: true,
            model: true,
            color: true,
            seats: true,
            status: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Driver profile not found');
    }

    return profile;
  }
}