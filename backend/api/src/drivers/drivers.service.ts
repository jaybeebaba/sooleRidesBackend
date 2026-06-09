import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { DriverStatus, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyDriverDto } from './dto/apply-driver.dto';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';


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

  async getMyRides(userId: string) {
  return this.prisma.ride.findMany({
    where: {
      driverId: userId,
    },
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
          totalAmount: true,
          status: true,
          passenger: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      departureTime: 'desc',
    },
  });
}

async getActiveRides(userId: string) {
  return this.prisma.ride.findMany({
    where: {
      driverId: userId,
      status: {
        in: ['PUBLISHED', 'FULL', 'STARTED'],
      },
    },
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
      vehicle: {
        select: {
          id: true,
          plateNumber: true,
          brand: true,
          model: true,
          color: true,
        },
      },
    },
    orderBy: {
      departureTime: 'asc',
    },
  });
}

async getRideById(userId: string, rideId: string) {
  const ride = await this.prisma.ride.findFirst({
    where: {
      id: rideId,
      driverId: userId,
    },
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
      stops: {
        orderBy: {
          stopOrder: 'asc',
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
      bookings: {
        select: {
          id: true,
          seatsBooked: true,
          totalAmount: true,
          serviceFee: true,
          status: true,
          createdAt: true,
          passenger: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
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

async getMyBookings(userId: string) {
  return this.prisma.booking.findMany({
    where: {
      ride: {
        driverId: userId,
      },
    },
    select: {
      id: true,
      seatsBooked: true,
      totalAmount: true,
      serviceFee: true,
      status: true,
      createdAt: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getPendingBookings(userId: string) {
  return this.prisma.booking.findMany({
    where: {
      status: 'REQUESTED',
      ride: {
        driverId: userId,
      },
    },
    select: {
      id: true,
      seatsBooked: true,
      totalAmount: true,
      serviceFee: true,
      status: true,
      createdAt: true,
      passenger: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
      ride: {
        select: {
          id: true,
          origin: true,
          destination: true,
          departureTime: true,
          availableSeats: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getBookingById(userId: string, bookingId: string) {
  const booking = await this.prisma.booking.findFirst({
    where: {
      id: bookingId,
      ride: {
        driverId: userId,
      },
    },
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
          stops: {
            orderBy: {
              stopOrder: 'asc',
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  return booking;
}

async acceptBooking(userId: string, bookingId: string) {
  return this.prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: bookingId,
        ride: {
          driverId: userId,
        },
      },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'REQUESTED') {
      throw new BadRequestException('Only requested bookings can be accepted');
    }

    if (booking.ride.availableSeats < booking.seatsBooked) {
      throw new BadRequestException('Not enough seats available');
    }

    const remainingSeats = booking.ride.availableSeats - booking.seatsBooked;

    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: 'PAYMENT_PENDING',
      },
    });

    await tx.ride.update({
      where: { id: booking.rideId },
      data: {
        availableSeats: remainingSeats,
        status: remainingSeats === 0 ? 'FULL' : booking.ride.status,
      },
    });

    await tx.notification.create({
      data: {
        userId: booking.passengerId,
        title: 'Booking accepted',
        body: `Your booking for ${booking.ride.origin} to ${booking.ride.destination} has been accepted. Please proceed to payment.`,
        type: NotificationType.RIDE,
      },
    });

    return {
      message: 'Booking accepted successfully',
      booking: updatedBooking,
    };
  });
}

async rejectBooking(userId: string, bookingId: string) {
  return this.prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: bookingId,
        ride: {
          driverId: userId,
        },
      },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'REQUESTED') {
      throw new BadRequestException('Only requested bookings can be rejected');
    }

    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: 'DRIVER_CANCELLED',
      },
    });

    await tx.notification.create({
      data: {
        userId: booking.passengerId,
        title: 'Booking rejected',
        body: `Your booking request for ${booking.ride.origin} to ${booking.ride.destination} was rejected by the driver.`,
        type: NotificationType.RIDE,
      },
    });

    return {
      message: 'Booking rejected successfully',
      booking: updatedBooking,
    };
  });
}

async startRide(userId: string, rideId: string) {
  return this.prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findFirst({
      where: {
        id: rideId,
        driverId: userId,
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PAYMENT_PENDING'],
            },
          },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status !== 'PUBLISHED' && ride.status !== 'FULL') {
      throw new BadRequestException(
        'Only published or full rides can be started',
      );
    }

    const updatedRide = await tx.ride.update({
      where: { id: ride.id },
      data: {
        status: 'STARTED',
      },
    });

    for (const booking of ride.bookings) {
      await tx.notification.create({
        data: {
          userId: booking.passengerId,
          title: 'Ride started',
          body: `Your ride from ${ride.origin} to ${ride.destination} has started.`,
          type: NotificationType.RIDE,
        },
      });
    }

    return {
      message: 'Ride started successfully',
      ride: updatedRide,
    };
  });
}

async completeRide(userId: string, rideId: string) {
  return this.prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findFirst({
      where: {
        id: rideId,
        driverId: userId,
      },
      include: {
        bookings: {
          where: {
            status: 'CONFIRMED',
          },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status !== 'STARTED') {
      throw new BadRequestException('Only started rides can be completed');
    }

    const updatedRide = await tx.ride.update({
      where: { id: ride.id },
      data: {
        status: 'COMPLETED',
      },
    });

    await tx.booking.updateMany({
      where: {
        rideId: ride.id,
        status: 'CONFIRMED',
      },
      data: {
        status: 'COMPLETED',
      },
    });

    for (const booking of ride.bookings) {
      await tx.notification.create({
        data: {
          userId: booking.passengerId,
          title: 'Ride completed',
          body: `Your ride from ${ride.origin} to ${ride.destination} has been completed.`,
          type: NotificationType.RIDE,
        },
      });
    }

    return {
      message: 'Ride completed successfully',
      ride: updatedRide,
    };
  });
}

async getEarnings(userId: string) {
  return this.prisma.booking.findMany({
    where: {
      ride: {
        driverId: userId,
      },
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
      payment: {
        status: 'SUCCESSFUL',
      },
    },
    select: {
      id: true,
      seatsBooked: true,
      totalAmount: true,
      serviceFee: true,
      status: true,
      createdAt: true,
      ride: {
        select: {
          id: true,
          origin: true,
          destination: true,
          departureTime: true,
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          reference: true,
          createdAt: true,
        },
      },
      passenger: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getEarningsSummary(userId: string) {
  const bookings = await this.prisma.booking.findMany({
    where: {
      ride: {
        driverId: userId,
      },
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
      payment: {
        status: 'SUCCESSFUL',
      },
    },
    select: {
      totalAmount: true,
      serviceFee: true,
    },
  });

  const grossEarnings = bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0,
  );

  const platformFees = bookings.reduce(
    (sum, booking) => sum + booking.serviceFee,
    0,
  );

  const netEarnings = grossEarnings - platformFees;

  return {
    totalPaidBookings: bookings.length,
    grossEarnings,
    platformFees,
    netEarnings,
  };
}

async getRideEarnings(userId: string, rideId: string) {
  const ride = await this.prisma.ride.findFirst({
    where: {
      id: rideId,
      driverId: userId,
    },
    select: {
      id: true,
      origin: true,
      destination: true,
      departureTime: true,
      status: true,
      pricePerSeat: true,
      bookings: {
        where: {
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
          payment: {
            status: 'SUCCESSFUL',
          },
        },
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
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              reference: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!ride) {
    throw new NotFoundException('Ride not found');
  }

  const grossEarnings = ride.bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0,
  );

  const platformFees = ride.bookings.reduce(
    (sum, booking) => sum + booking.serviceFee,
    0,
  );

  const netEarnings = grossEarnings - platformFees;

  return {
    ride: {
      id: ride.id,
      origin: ride.origin,
      destination: ride.destination,
      departureTime: ride.departureTime,
      status: ride.status,
      pricePerSeat: ride.pricePerSeat,
    },
    summary: {
      totalPaidBookings: ride.bookings.length,
      grossEarnings,
      platformFees,
      netEarnings,
    },
    bookings: ride.bookings,
  };
}

async getRidePassengers(userId: string, rideId: string) {
  const ride = await this.prisma.ride.findFirst({
    where: {
      id: rideId,
      driverId: userId,
    },
  });

  if (!ride) {
    throw new NotFoundException('Ride not found');
  }

  return this.prisma.booking.findMany({
    where: {
      rideId,
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
    },
    select: {
      id: true,
      seatsBooked: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      passenger: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isIdentityVerified: true,
          isFaceVerified: true,
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          reference: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}

async updateMe(userId: string, dto: UpdateDriverProfileDto) {
  const driverProfile = await this.prisma.driverProfile.findUnique({
    where: { userId },
  });

  if (!driverProfile) {
    throw new NotFoundException('Driver profile not found');
  }

  return this.prisma.driverProfile.update({
    where: { userId },
    data: {
      licenseNumber: dto.licenseNumber?.trim(),
      bio: dto.bio?.trim(),
      yearsDriving: dto.yearsDriving,
    },
    select: {
      id: true,
      status: true,
      licenseNumber: true,
      bio: true,
      yearsDriving: true,
      updatedAt: true,
    },
  });
}

async cancelRide(userId: string, rideId: string) {
  return this.prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findFirst({
      where: {
        id: rideId,
        driverId: userId,
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['REQUESTED', 'PAYMENT_PENDING', 'CONFIRMED'],
            },
          },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status === 'STARTED' || ride.status === 'COMPLETED') {
      throw new BadRequestException(
        'Started or completed rides cannot be cancelled',
      );
    }

    if (ride.status === 'CANCELLED') {
      throw new BadRequestException('Ride is already cancelled');
    }

    const updatedRide = await tx.ride.update({
      where: { id: ride.id },
      data: {
        status: 'CANCELLED',
      },
    });

    await tx.booking.updateMany({
      where: {
        rideId: ride.id,
        status: {
          in: ['REQUESTED', 'PAYMENT_PENDING', 'CONFIRMED'],
        },
      },
      data: {
        status: 'DRIVER_CANCELLED',
      },
    });

    for (const booking of ride.bookings) {
      await tx.notification.create({
        data: {
          userId: booking.passengerId,
          title: 'Ride cancelled',
          body: `Your ride from ${ride.origin} to ${ride.destination} was cancelled by the driver.`,
          type: NotificationType.RIDE,
        },
      });
    }

    return {
      message: 'Ride cancelled successfully',
      ride: updatedRide,
    };
  });
}

async getDashboard(userId: string) {
  const driverProfile = await this.prisma.driverProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!driverProfile) {
    throw new NotFoundException('Driver profile not found');
  }

  const [
    totalRides,
    activeRides,
    completedRides,
    pendingBookings,
    confirmedBookings,
    approvedVehicles,
    earningsSummary,
  ] = await Promise.all([
    this.prisma.ride.count({ where: { driverId: userId } }),
    this.prisma.ride.count({
      where: { driverId: userId, status: { in: ['PUBLISHED', 'FULL', 'STARTED'] } },
    }),
    this.prisma.ride.count({
      where: { driverId: userId, status: 'COMPLETED' },
    }),
    this.prisma.booking.count({
      where: { ride: { driverId: userId }, status: 'REQUESTED' },
    }),
    this.prisma.booking.count({
      where: { ride: { driverId: userId }, status: 'CONFIRMED' },
    }),
    this.prisma.vehicle.count({
      where: { driverProfileId: driverProfile.id, status: 'APPROVED' },
    }),
    this.getEarningsSummary(userId),
  ]);

  return {
    driverStatus: driverProfile.status,
    totalRides,
    activeRides,
    completedRides,
    pendingBookings,
    confirmedBookings,
    approvedVehicles,
    earnings: earningsSummary,
  };
}
}