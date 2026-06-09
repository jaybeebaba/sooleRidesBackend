import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, RideStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdentityVerified: true,
      isFaceVerified: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (
    !user.isEmailVerified ||
    !user.isPhoneVerified ||
    !user.isIdentityVerified ||
    !user.isFaceVerified
  ) {
    throw new ForbiddenException('Complete all verifications before booking');
  }

  return this.prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findUnique({
      where: { id: dto.rideId },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId === userId) {
      throw new ForbiddenException('You cannot book your own ride');
    }

    if (ride.status !== RideStatus.PUBLISHED) {
      throw new BadRequestException('Ride is not available for booking');
    }

    if (ride.departureTime <= new Date()) {
      throw new BadRequestException('Ride has already departed');
    }

    if (ride.availableSeats < dto.seatsBooked) {
      throw new BadRequestException('Not enough seats available');
    }

    const serviceFee = Math.round(ride.pricePerSeat * dto.seatsBooked * 0.1);
    const totalAmount = ride.pricePerSeat * dto.seatsBooked + serviceFee;

    const booking = await tx.booking.create({
      data: {
        passengerId: userId,
        rideId: ride.id,
        seatsBooked: dto.seatsBooked,
        serviceFee,
        totalAmount,
        status: ride.instantBooking
          ? BookingStatus.PAYMENT_PENDING
          : BookingStatus.REQUESTED,
      },
      include: {
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
            pricePerSeat: true,
            driver: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    await tx.notification.create({
      data: {
        userId: ride.driverId,
        title: ride.instantBooking ? 'New booking' : 'New booking request',
        body: `${booking.passenger.fullName ?? 'A passenger'} booked ${
          dto.seatsBooked
        } seat(s) for your ${ride.origin} to ${ride.destination} ride.`,
        type: 'BOOKING',
      },
    });

    if (ride.instantBooking) {
      const remainingSeats = ride.availableSeats - dto.seatsBooked;

      await tx.ride.update({
        where: { id: ride.id },
        data: {
          availableSeats: remainingSeats,
          status: remainingSeats === 0 ? RideStatus.FULL : RideStatus.PUBLISHED,
        },
      });
    }

    return booking;
  });
}

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        passengerId: userId,
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
            estimatedArrivalTime: true,
            pricePerSeat: true,
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
                brand: true,
                model: true,
                color: true,
                plateNumber: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            provider: true,
            reference: true,
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
        passengerId: userId,
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
            estimatedArrivalTime: true,
            pricePerSeat: true,
            status: true,
            stops: {
              orderBy: {
                stopOrder: 'asc',
              },
            },
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
                brand: true,
                model: true,
                color: true,
                plateNumber: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            provider: true,
            reference: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancel(userId: string, bookingId: string) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          passengerId: userId,
        },
        include: {
          ride: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      if (
        booking.status === BookingStatus.PASSENGER_CANCELLED ||
        booking.status === BookingStatus.DRIVER_CANCELLED ||
        booking.status === BookingStatus.COMPLETED ||
        booking.status === BookingStatus.REFUNDED
      ) {
        throw new BadRequestException('Booking cannot be cancelled');
      }

      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.PASSENGER_CANCELLED,
        },
      });

      if (
        booking.status === BookingStatus.PAYMENT_PENDING ||
        booking.status === BookingStatus.CONFIRMED
      ) {
        const newAvailableSeats =
          booking.ride.availableSeats + booking.seatsBooked;

        await tx.ride.update({
          where: { id: booking.rideId },
          data: {
            availableSeats: newAvailableSeats,
            status:
              booking.ride.status === RideStatus.FULL
                ? RideStatus.PUBLISHED
                : booking.ride.status,
          },
        });
      }

      return {
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
      };
    });
  }
}