import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException
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

    return {
      message: 'Booking accepted successfully',
      booking: updatedBooking,
    };
  });
}

async rejectBooking(userId: string, bookingId: string) {
  const booking = await this.prisma.booking.findFirst({
    where: {
      id: bookingId,
      ride: {
        driverId: userId,
      },
    },
  });

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  if (booking.status !== 'REQUESTED') {
    throw new BadRequestException('Only requested bookings can be rejected');
  }

  const updatedBooking = await this.prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'DRIVER_CANCELLED',
    },
  });

  return {
    message: 'Booking rejected successfully',
    booking: updatedBooking,
  };
}

async startRide(userId: string, rideId: string) {
  const ride = await this.prisma.ride.findFirst({
    where: {
      id: rideId,
      driverId: userId,
    },
  });

  if (!ride) {
    throw new NotFoundException('Ride not found');
  }

  if (ride.status !== 'PUBLISHED' && ride.status !== 'FULL') {
    throw new BadRequestException('Only published or full rides can be started');
  }

  const updatedRide = await this.prisma.ride.update({
    where: { id: ride.id },
    data: {
      status: 'STARTED',
    },
  });

  return {
    message: 'Ride started successfully',
    ride: updatedRide,
  };
}

async completeRide(userId: string, rideId: string) {
  return this.prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findFirst({
      where: {
        id: rideId,
        driverId: userId,
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

    return {
      message: 'Ride completed successfully',
      ride: updatedRide,
    };
  });
}
}