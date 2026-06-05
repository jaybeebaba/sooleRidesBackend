import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, UserRole, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingDrivers() {
    return this.prisma.driverProfile.findMany({
      where: {
        status: DriverStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
        licenseNumber: true,
        bio: true,
        yearsDriving: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            isEmailVerified: true,
            isPhoneVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveDriver(driverProfileId: string) {
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedDriver = await tx.driverProfile.update({
        where: { id: driverProfileId },
        data: {
          status: DriverStatus.APPROVED,
        },
        select: {
          id: true,
          status: true,
          userId: true,
        },
      });

      await tx.user.update({
        where: { id: updatedDriver.userId },
        data: {
          role: UserRole.DRIVER,
        },
      });

      return {
        message: 'Driver approved successfully',
        driver: updatedDriver,
      };
    });
  }

  async rejectDriver(driverProfileId: string) {
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    const updatedDriver = await this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        status: DriverStatus.REJECTED,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    });

    return {
      message: 'Driver rejected successfully',
      driver: updatedDriver,
    };
  }

  async getPendingVehicles() {
    return this.prisma.vehicle.findMany({
      where: {
        status: VehicleStatus.PENDING,
      },
      select: {
        id: true,
        plateNumber: true,
        brand: true,
        model: true,
        color: true,
        year: true,
        seats: true,
        status: true,
        createdAt: true,
        driverProfile: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.APPROVED,
      },
    });

    return {
      message: 'Vehicle approved successfully',
      vehicle: updatedVehicle,
    };
  }

  async rejectVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.REJECTED,
      },
    });

    return {
      message: 'Vehicle rejected successfully',
      vehicle: updatedVehicle,
    };
  }

  async getAllDrivers() {
  return this.prisma.driverProfile.findMany({
    select: {
      id: true,
      status: true,
      licenseNumber: true,
      bio: true,
      yearsDriving: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
        },
      },
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getDriverById(driverProfileId: string) {
  const driver = await this.prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
    select: {
      id: true,
      status: true,
      licenseNumber: true,
      bio: true,
      yearsDriving: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
        },
      },
      vehicles: true,
    },
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }

  return driver;
}

async suspendDriver(driverProfileId: string) {
  const driver = await this.prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }

  const updatedDriver = await this.prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: {
      status: DriverStatus.SUSPENDED,
    },
  });

  return {
    message: 'Driver suspended successfully',
    driver: updatedDriver,
  };
}

async unsuspendDriver(driverProfileId: string) {
  const driver = await this.prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }

  const updatedDriver = await this.prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: {
      status: DriverStatus.APPROVED,
    },
  });

  return {
    message: 'Driver unsuspended successfully',
    driver: updatedDriver,
  };
}
}