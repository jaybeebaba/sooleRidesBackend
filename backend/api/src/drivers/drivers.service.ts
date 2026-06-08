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
}