import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { DriverStatus, ReportStatus, UserRole, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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

async suspendUser(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    throw new BadRequestException('Super admin cannot be suspended');
  }

  const updatedUser = await this.prisma.user.update({
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

  return {
    message: 'User suspended successfully',
    user: updatedUser,
  };
}

async activateUser(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const updatedUser = await this.prisma.user.update({
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

  return {
    message: 'User activated successfully',
    user: updatedUser,
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

async removeRide(rideId: string) {
  const ride = await this.prisma.ride.findUnique({
    where: { id: rideId },
  });

  if (!ride) {
    throw new NotFoundException('Ride not found');
  }

  const updatedRide = await this.prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'REMOVED_BY_ADMIN',
    },
  });

  return {
    message: 'Ride removed successfully',
    ride: updatedRide,
  };
}
}