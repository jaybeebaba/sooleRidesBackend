import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriverStatus, RideStatus, VehicleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { SearchRidesDto } from './dto/search-rides.dto';
import { UpdateRideDto } from './dto/update-ride.dto';

@Injectable()
export class RidesService {
  constructor(private readonly prisma: PrismaService) { }

  private async getApprovedDriverProfile(userId: string) {
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!driverProfile) {
      throw new ForbiddenException('You must apply as a driver first');
    }

    if (driverProfile.status !== DriverStatus.APPROVED) {
      throw new ForbiddenException('Driver profile is not approved');
    }

    return driverProfile;
  }

  async create(userId: string, dto: CreateRideDto) {
    const driverProfile = await this.getApprovedDriverProfile(userId);

    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: dto.vehicleId,
        driverProfileId: driverProfile.id,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== VehicleStatus.APPROVED) {
      throw new ForbiddenException('Vehicle is not approved');
    }

    if (dto.totalSeats > vehicle.seats) {
      throw new BadRequestException('Total seats cannot exceed vehicle seats');
    }

    const departureTime = new Date(dto.departureTime);

    if (departureTime <= new Date()) {
      throw new BadRequestException('Departure time must be in the future');
    }

    if (
      dto.estimatedArrivalTime &&
      new Date(dto.estimatedArrivalTime) <= departureTime
    ) {
      throw new BadRequestException(
        'Estimated arrival time must be after departure time',
      );
    }

    return this.prisma.ride.create({
      data: {
        driverId: userId,
        vehicleId: dto.vehicleId,
        origin: dto.origin.trim(),
        destination: dto.destination.trim(),
        departureTime,
        estimatedArrivalTime: dto.estimatedArrivalTime
          ? new Date(dto.estimatedArrivalTime)
          : undefined,
        pricePerSeat: dto.pricePerSeat,
        totalSeats: dto.totalSeats,
        availableSeats: dto.totalSeats,
        instantBooking: dto.instantBooking ?? true,
        status: RideStatus.PUBLISHED,
        stops: dto.stops?.length
          ? {
            create: dto.stops.map((stop) => ({
              city: stop.city.trim(),
              address: stop.address?.trim(),
              stopOrder: stop.stopOrder,
            })),
          }
          : undefined,
      },
      include: {
        stops: {
          orderBy: {
            stopOrder: 'asc',
          },
        },
        vehicle: true,
      },
    });
  }

  async getMyRides(userId: string) {
    return this.prisma.ride.findMany({
      where: {
        driverId: userId,
      },
      include: {
        vehicle: true,
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

  async search(dto: SearchRidesDto) {
    const seats = dto.seats ?? 1;

    let dateFilter = {};

    if (dto.date) {
      const start = new Date(dto.date);
      const end = new Date(dto.date);
      end.setDate(end.getDate() + 1);

      dateFilter = {
        departureTime: {
          gte: start,
          lt: end,
        },
      };
    } else {
      dateFilter = {
        departureTime: {
          gt: new Date(),
        },
      };
    }

    return this.prisma.ride.findMany({
      where: {
        status: RideStatus.PUBLISHED,
        availableSeats: {
          gte: seats,
        },
        origin: {
          contains: dto.origin,
          mode: 'insensitive',
        },
        destination: {
          contains: dto.destination,
          mode: 'insensitive',
        },
        ...dateFilter,
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
        driver: {
          select: {
            id: true,
            fullName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            color: true,
          },
        },
        stops: {
          select: {
            city: true,
            address: true,
            stopOrder: true,
          },
          orderBy: {
            stopOrder: 'asc',
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      },
    });
  }

  async findOne(rideId: string) {
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
        driver: {
          select: {
            id: true,
            fullName: true,
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
            seats: true,
          },
        },
        stops: {
          orderBy: {
            stopOrder: 'asc',
          },
        },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    return ride;
  }

  async update(userId: string, rideId: string, dto: UpdateRideDto) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        driverId: userId,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status !== RideStatus.PUBLISHED && ride.status !== RideStatus.DRAFT) {
      throw new BadRequestException('Only draft or published rides can be updated');
    }

    return this.prisma.ride.update({
      where: { id: rideId },
      data: {
        origin: dto.origin?.trim(),
        destination: dto.destination?.trim(),
        departureTime: dto.departureTime
          ? new Date(dto.departureTime)
          : undefined,
        estimatedArrivalTime: dto.estimatedArrivalTime
          ? new Date(dto.estimatedArrivalTime)
          : undefined,
        pricePerSeat: dto.pricePerSeat,
        instantBooking: dto.instantBooking,
      },
      include: {
        stops: {
          orderBy: {
            stopOrder: 'asc',
          },
        },
        vehicle: true,
      },
    });
  }

  async cancel(userId: string, rideId: string) {
    const ride = await this.prisma.ride.findFirst({
      where: {
        id: rideId,
        driverId: userId,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (
      ride.status === RideStatus.COMPLETED ||
      ride.status === RideStatus.CANCELLED
    ) {
      throw new BadRequestException('Ride cannot be cancelled');
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CANCELLED,
      },
    });

    return {
      message: 'Ride cancelled successfully',
      ride: updatedRide,
    };
  }

  async getPopularRoutes() {
    const routes = await this.prisma.ride.groupBy({
      by: ['origin', 'destination'],
      where: {
        status: {
          in: [RideStatus.PUBLISHED, RideStatus.COMPLETED],
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        pricePerSeat: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 6,
    });

    return routes.map((route) => ({
      origin: route.origin,
      destination: route.destination,
      rideCount: route._count.id,
      averagePrice: Math.round(route._avg.pricePerSeat || 0),
    }));
  }
}