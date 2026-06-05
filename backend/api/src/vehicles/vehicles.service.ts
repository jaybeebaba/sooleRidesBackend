import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriverStatus, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getApprovedDriverProfile(userId: string) {
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!driverProfile) {
      throw new ForbiddenException('You must apply as a driver first');
    }

    if (driverProfile.status !== DriverStatus.APPROVED) {
      throw new ForbiddenException('Driver profile is not approved yet');
    }

    return driverProfile;
  }

  async create(userId: string, dto: CreateVehicleDto) {
    const driverProfile = await this.getApprovedDriverProfile(userId);

    return this.prisma.vehicle.create({
      data: {
        driverProfileId: driverProfile.id,
        plateNumber: dto.plateNumber.trim().toUpperCase(),
        brand: dto.brand.trim(),
        model: dto.model.trim(),
        color: dto.color.trim(),
        year: dto.year,
        seats: dto.seats,
        status: VehicleStatus.PENDING,
      },
    });
  }

  async findMine(userId: string) {
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!driverProfile) {
      return [];
    }

    return this.prisma.vehicle.findMany({
      where: {
        driverProfileId: driverProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        driverProfile: {
          userId,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(userId: string, vehicleId: string, dto: UpdateVehicleDto) {
    await this.findOne(userId, vehicleId);

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        plateNumber: dto.plateNumber?.trim().toUpperCase(),
        brand: dto.brand?.trim(),
        model: dto.model?.trim(),
        color: dto.color?.trim(),
        year: dto.year,
        seats: dto.seats,
        status: VehicleStatus.PENDING,
      },
    });
  }

  async remove(userId: string, vehicleId: string) {
    await this.findOne(userId, vehicleId);

    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return {
      message: 'Vehicle deleted successfully',
    };
  }
}