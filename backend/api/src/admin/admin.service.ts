import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverStatus, ReportStatus, UserRole, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getDriverVehicles(driverProfileId: string) {
  const driver = await this.prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }

  return this.prisma.vehicle.findMany({
    where: {
      driverProfileId,
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
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
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

  async getAllVehicles() {
  return this.prisma.vehicle.findMany({
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
      updatedAt: true,
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
              role: true,
              isActive: true,
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

async getVehicleById(vehicleId: string) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
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
      updatedAt: true,
      driverProfile: {
        select: {
          id: true,
          status: true,
          licenseNumber: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
        },
      },
      rides: {
        select: {
          id: true,
          origin: true,
          destination: true,
          departureTime: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  return vehicle;
}

async suspendVehicle(vehicleId: string) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  const updatedVehicle = await this.prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      status: VehicleStatus.SUSPENDED,
    },
  });

  return {
    message: 'Vehicle suspended successfully',
    vehicle: updatedVehicle,
  };
}

async unsuspendVehicle(vehicleId: string) {
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
    message: 'Vehicle unsuspended successfully',
    vehicle: updatedVehicle,
  };
}

async getAllReports() {
  return this.prisma.report.findMany({
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reporter: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      reportedUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getReportById(reportId: string) {
  const report = await this.prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reporter: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      reportedUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!report) {
    throw new NotFoundException('Report not found');
  }

  return report;
}

async updateReportStatus(reportId: string, status: ReportStatus) {
  const report = await this.prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new NotFoundException('Report not found');
  }

  return this.prisma.report.update({
    where: { id: reportId },
    data: { status },
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      updatedAt: true,
    },
  });
}
}