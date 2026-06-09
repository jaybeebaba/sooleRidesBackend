import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';
import { CreateSavedRouteDto } from './dto/create-saved-route.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';

@Injectable()
export class PassengersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateMe(userId: string, dto: UpdatePassengerProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        updatedAt: true,
      },
    });
  }

  async getSavedRoutes(userId: string) {
  return this.prisma.savedRoute.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

async createSavedRoute(userId: string, dto: CreateSavedRouteDto) {
  return this.prisma.savedRoute.create({
    data: {
      userId,
      origin: dto.origin.trim(),
      destination: dto.destination.trim(),
    },
  });
}

async deleteSavedRoute(userId: string, routeId: string) {
  const route = await this.prisma.savedRoute.findFirst({
    where: {
      id: routeId,
      userId,
    },
  });

  if (!route) {
    throw new NotFoundException('Saved route not found');
  }

  await this.prisma.savedRoute.delete({
    where: { id: routeId },
  });

  return {
    message: 'Saved route deleted successfully',
  };
}

async getEmergencyContacts(userId: string) {
  return this.prisma.emergencyContact.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

async createEmergencyContact(
  userId: string,
  dto: CreateEmergencyContactDto,
) {
  return this.prisma.emergencyContact.create({
    data: {
      userId,
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      relationship: dto.relationship?.trim(),
    },
  });
}

async deleteEmergencyContact(userId: string, contactId: string) {
  const contact = await this.prisma.emergencyContact.findFirst({
    where: {
      id: contactId,
      userId,
    },
  });

  if (!contact) {
    throw new NotFoundException('Emergency contact not found');
  }

  await this.prisma.emergencyContact.delete({
    where: { id: contactId },
  });

  return {
    message: 'Emergency contact deleted successfully',
  };
}

async getMyTrips(userId: string) {
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

async getMyTripById(userId: string, tripId: string) {
  const trip = await this.prisma.booking.findFirst({
    where: {
      id: tripId,
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
            select: {
              id: true,
              city: true,
              address: true,
              stopOrder: true,
            },
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

  if (!trip) {
    throw new NotFoundException('Trip not found');
  }

  return trip;
}

async getUpcomingTrips(userId: string) {
  return this.prisma.booking.findMany({
    where: {
      passengerId: userId,
      status: {
        in: ['PAYMENT_PENDING', 'CONFIRMED'],
      },
      ride: {
        departureTime: {
          gt: new Date(),
        },
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
    },
    orderBy: {
      ride: {
        departureTime: 'asc',
      },
    },
  });
}

async getCompletedTrips(userId: string) {
  return this.prisma.booking.findMany({
    where: {
      passengerId: userId,
      status: 'COMPLETED',
    },
    include: {
      ride: {
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
          vehicle: true,
        },
      },
      payment: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

async getCancelledTrips(userId: string) {
  return this.prisma.booking.findMany({
    where: {
      passengerId: userId,
      status: {
        in: ['PASSENGER_CANCELLED', 'DRIVER_CANCELLED', 'REFUNDED'],
      },
    },
    include: {
      ride: {
        include: {
          driver: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
          vehicle: true,
        },
      },
      payment: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

async getDashboard(userId: string) {
  const [
    upcomingTrips,
    completedTrips,
    cancelledTrips,
    savedRoutes,
    unreadNotifications,
  ] = await Promise.all([
    this.prisma.booking.count({
      where: {
        passengerId: userId,
        status: { in: ['PAYMENT_PENDING', 'CONFIRMED'] },
        ride: { departureTime: { gt: new Date() } },
      },
    }),
    this.prisma.booking.count({
      where: { passengerId: userId, status: 'COMPLETED' },
    }),
    this.prisma.booking.count({
      where: {
        passengerId: userId,
        status: {
          in: ['PASSENGER_CANCELLED', 'DRIVER_CANCELLED', 'REFUNDED'],
        },
      },
    }),
    this.prisma.savedRoute.count({ where: { userId } }),
    this.prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    upcomingTrips,
    completedTrips,
    cancelledTrips,
    savedRoutes,
    unreadNotifications,
  };
}
}