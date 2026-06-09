import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { DriverStatus, ReportStatus, UserRole, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';

@Injectable()
export class AdminService {
 constructor(
  private readonly prisma: PrismaService,
  private readonly auditLogsService: AuditLogsService,
) {}

  async getUserById(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isFaceVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      driverProfile: {
        select: {
          id: true,
          status: true,
          licenseNumber: true,
          yearsDriving: true,
          vehicles: {
            select: {
              id: true,
              plateNumber: true,
              brand: true,
              model: true,
              status: true,
            },
          },
        },
      },
      bookings: {
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          ride: {
            select: {
              id: true,
              origin: true,
              destination: true,
              departureTime: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async suspendUser(adminId: string, userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    throw new BadRequestException('Super admin cannot be suspended');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'SUSPEND_USER',
        entity: 'User',
        entityId: userId,
        metadata: {
          suspendedUserEmail: user.email,
          suspendedUserRole: user.role,
        },
      },
    });

    return {
      message: 'User suspended successfully',
      user: updatedUser,
    };
  });
}

async activateUser(adminId: string, userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'ACTIVATE_USER',
        entity: 'User',
        entityId: userId,
        metadata: {
          activatedUserEmail: user.email,
          activatedUserRole: user.role,
        },
      },
    });

    return {
      message: 'User activated successfully',
      user: updatedUser,
    };
  });
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

async suspendDriver(adminId: string, driverProfileId: string) {
  const driver = await this.prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedDriver = await tx.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        status: DriverStatus.SUSPENDED,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'SUSPEND_DRIVER',
        entity: 'DriverProfile',
        entityId: driverProfileId,
        metadata: {
          driverUserId: driver.userId,
          previousStatus: driver.status,
        },
      },
    });

    return {
      message: 'Driver suspended successfully',
      driver: updatedDriver,
    };
  });
}

async unsuspendDriver(adminId: string, driverProfileId: string) {
  const driver = await this.prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedDriver = await tx.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        status: DriverStatus.APPROVED,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'UNSUSPEND_DRIVER',
        entity: 'DriverProfile',
        entityId: driverProfileId,
        metadata: {
          driverUserId: driver.userId,
          previousStatus: driver.status,
        },
      },
    });

    return {
      message: 'Driver unsuspended successfully',
      driver: updatedDriver,
    };
  });
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

  async approveDriver(adminId: string, driverProfileId: string) {
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

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'APPROVE_DRIVER',
        entity: 'DriverProfile',
        entityId: driverProfileId,
        metadata: {
          approvedUserId: updatedDriver.userId,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: updatedDriver.userId,
        title: 'Driver application approved',
        body: 'Your driver account has been approved. You can now use Driver Mode.',
        type: 'SYSTEM',
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

  async rejectDriver(adminId: string, driverProfileId: string) {
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
        status: DriverStatus.REJECTED,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'REJECT_DRIVER',
        entity: 'DriverProfile',
        entityId: driverProfileId,
        metadata: {
          rejectedUserId: updatedDriver.userId,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: updatedDriver.userId,
        title: 'Driver application rejected',
        body: 'Your driver application was rejected. Please contact support for details.',
        type: 'SYSTEM',
      },
    });

    return {
      message: 'Driver rejected successfully',
      driver: updatedDriver,
    };
  });
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

  async approveVehicle(adminId: string, vehicleId: string) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      driverProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedVehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.APPROVED,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'APPROVE_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicleId,
        metadata: {
          driverUserId: vehicle.driverProfile.userId,
          plateNumber: vehicle.plateNumber,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: vehicle.driverProfile.userId,
        title: 'Vehicle approved',
        body: `${vehicle.plateNumber} has been approved for rides.`,
        type: 'SYSTEM',
      },
    });

    return {
      message: 'Vehicle approved successfully',
      vehicle: updatedVehicle,
    };
  });
}

 async rejectVehicle(adminId: string, vehicleId: string) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      driverProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedVehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.REJECTED,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'REJECT_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicleId,
        metadata: {
          driverUserId: vehicle.driverProfile.userId,
          plateNumber: vehicle.plateNumber,
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: vehicle.driverProfile.userId,
        title: 'Vehicle rejected',
        body: `${vehicle.plateNumber} was rejected. Please review and resubmit.`,
        type: 'SYSTEM',
      },
    });

    return {
      message: 'Vehicle rejected successfully',
      vehicle: updatedVehicle,
    };
  });
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

async suspendVehicle(adminId: string, vehicleId: string) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      driverProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedVehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.SUSPENDED,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'SUSPEND_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicleId,
        metadata: {
          driverUserId: vehicle.driverProfile.userId,
          plateNumber: vehicle.plateNumber,
          previousStatus: vehicle.status,
        },
      },
    });

    return {
      message: 'Vehicle suspended successfully',
      vehicle: updatedVehicle,
    };
  });
}

async unsuspendVehicle(adminId: string, vehicleId: string) {
  const vehicle = await this.prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      driverProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundException('Vehicle not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedVehicle = await tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: VehicleStatus.APPROVED,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'UNSUSPEND_VEHICLE',
        entity: 'Vehicle',
        entityId: vehicleId,
        metadata: {
          driverUserId: vehicle.driverProfile.userId,
          plateNumber: vehicle.plateNumber,
          previousStatus: vehicle.status,
        },
      },
    });

    return {
      message: 'Vehicle unsuspended successfully',
      vehicle: updatedVehicle,
    };
  });
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

async updateReportStatus(
  adminId: string,
  reportId: string,
  status: ReportStatus,
) {
  const report = await this.prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      status: true,
      reporterId: true,
      reportedUserId: true,
      reason: true,
    },
  });

  if (!report) {
    throw new NotFoundException('Report not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedReport = await tx.report.update({
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

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_REPORT_STATUS',
        entity: 'Report',
        entityId: reportId,
        metadata: {
          previousStatus: report.status,
          newStatus: status,
          reporterId: report.reporterId,
          reportedUserId: report.reportedUserId,
          reason: report.reason,
        },
      },
    });

    return updatedReport;
  });
}

async getAllBookings() {
  return this.prisma.booking.findMany({
    select: {
      id: true,
      seatsBooked: true,
      totalAmount: true,
      serviceFee: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      passenger: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      ride: {
        select: {
          id: true,
          origin: true,
          destination: true,
          departureTime: true,
          status: true,
          driver: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          reference: true,
          provider: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getBookingById(bookingId: string) {
  const booking = await this.prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      seatsBooked: true,
      totalAmount: true,
      serviceFee: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      passenger: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isIdentityVerified: true,
          isFaceVerified: true,
        },
      },
      ride: {
        select: {
          id: true,
          origin: true,
          destination: true,
          departureTime: true,
          estimatedArrivalTime: true,
          pricePerSeat: true,
          availableSeats: true,
          totalSeats: true,
          status: true,
          driver: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plateNumber: true,
              brand: true,
              model: true,
              color: true,
              status: true,
            },
          },
          stops: {
            orderBy: {
              stopOrder: 'asc',
            },
          },
        },
      },
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  return booking;
}

async getAllPayments() {
  return this.prisma.payment.findMany({
    select: {
      id: true,
      amount: true,
      reference: true,
      provider: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      booking: {
        select: {
          id: true,
          status: true,
          seatsBooked: true,
          totalAmount: true,
          passenger: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          ride: {
            select: {
              id: true,
              origin: true,
              destination: true,
              departureTime: true,
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

async getPaymentById(paymentId: string) {
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      amount: true,
      reference: true,
      provider: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      booking: {
        select: {
          id: true,
          seatsBooked: true,
          totalAmount: true,
          serviceFee: true,
          status: true,
          passenger: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          ride: {
            select: {
              id: true,
              origin: true,
              destination: true,
              departureTime: true,
              driver: {
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
      },
    },
  });

  if (!payment) {
    throw new NotFoundException('Payment not found');
  }

  return payment;
}

async getAllRides() {
  return this.prisma.ride.findMany({
    select: {
      id: true,
      origin: true,
      destination: true,
      departureTime: true,
      estimatedArrivalTime: true,
      pricePerSeat: true,
      availableSeats: true,
      totalSeats: true,
      instantBooking: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      driver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          color: true,
          status: true,
        },
      },
      bookings: {
        select: {
          id: true,
          seatsBooked: true,
          status: true,
          totalAmount: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getRideById(rideId: string) {
  const ride = await this.prisma.ride.findUnique({
    where: { id: rideId },
    select: {
      id: true,
      origin: true,
      destination: true,
      departureTime: true,
      estimatedArrivalTime: true,
      pricePerSeat: true,
      availableSeats: true,
      totalSeats: true,
      instantBooking: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      driver: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
        },
      },
      vehicle: {
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
      stops: {
        orderBy: {
          stopOrder: 'asc',
        },
      },
      bookings: {
        select: {
          id: true,
          seatsBooked: true,
          totalAmount: true,
          serviceFee: true,
          status: true,
          passenger: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              reference: true,
            },
          },
        },
      },
    },
  });

  if (!ride) {
    throw new NotFoundException('Ride not found');
  }

  return ride;
}

async removeRide(adminId: string, rideId: string) {
  const ride = await this.prisma.ride.findUnique({
    where: { id: rideId },
    select: {
      id: true,
      origin: true,
      destination: true,
      driverId: true,
      status: true,
    },
  });

  if (!ride) {
    throw new NotFoundException('Ride not found');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedRide = await tx.ride.update({
      where: { id: rideId },
      data: {
        status: 'REMOVED_BY_ADMIN',
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'REMOVE_RIDE',
        entity: 'Ride',
        entityId: rideId,
        metadata: {
          driverId: ride.driverId,
          origin: ride.origin,
          destination: ride.destination,
          previousStatus: ride.status,
        },
      },
    });

    return {
      message: 'Ride removed successfully',
      ride: updatedRide,
    };
  });
}

async getStats() {
  const [
    totalUsers,
    totalDrivers,
    pendingDrivers,
    totalVehicles,
    pendingVehicles,
    totalRides,
    activeRides,
    completedRides,
    totalBookings,
    confirmedBookings,
    totalPayments,
    successfulPayments,
    openReports,
  ] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.driverProfile.count(),
    this.prisma.driverProfile.count({ where: { status: 'PENDING' } }),
    this.prisma.vehicle.count(),
    this.prisma.vehicle.count({ where: { status: 'PENDING' } }),
    this.prisma.ride.count(),
    this.prisma.ride.count({
      where: { status: { in: ['PUBLISHED', 'FULL', 'STARTED'] } },
    }),
    this.prisma.ride.count({ where: { status: 'COMPLETED' } }),
    this.prisma.booking.count(),
    this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    this.prisma.payment.count(),
    this.prisma.payment.count({ where: { status: 'SUCCESSFUL' } }),
    this.prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    users: {
      totalUsers,
      totalDrivers,
      pendingDrivers,
    },
    vehicles: {
      totalVehicles,
      pendingVehicles,
    },
    rides: {
      totalRides,
      activeRides,
      completedRides,
    },
    bookings: {
      totalBookings,
      confirmedBookings,
    },
    payments: {
      totalPayments,
      successfulPayments,
    },
    reports: {
      openReports,
    },
  };
}

async getAuditLogs() {
  return this.prisma.auditLog.findMany({
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getAuditLogById(auditLogId: string) {
  const auditLog = await this.prisma.auditLog.findUnique({
    where: { id: auditLogId },
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!auditLog) {
    throw new NotFoundException('Audit log not found');
  }

  return auditLog;
}

async getUserNotifications(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const notifications = await this.prisma.notification.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      body: true,
      type: true,
      isRead: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    user,
    notifications,
  };
}
}