import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        ride: true,
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed trips');
    }

    const isPassenger = booking.passengerId === userId;
    const isDriver = booking.ride.driverId === userId;

    if (!isPassenger && !isDriver) {
      throw new ForbiddenException('You are not part of this booking');
    }

    const validReviewee =
      (isPassenger && dto.revieweeId === booking.ride.driverId) ||
      (isDriver && dto.revieweeId === booking.passengerId);

    if (!validReviewee) {
      throw new BadRequestException('Invalid review recipient');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    return this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        reviewerId: userId,
        revieweeId: dto.revieweeId,
        rating: dto.rating,
        comment: dto.comment?.trim(),
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        booking: {
          select: {
            id: true,
            ride: {
              select: {
                origin: true,
                destination: true,
              },
            },
          },
        },
      },
    });
  }

  async getMyReviews(userId: string) {
    return this.prisma.review.findMany({
      where: {
        OR: [{ reviewerId: userId }, { revieweeId: userId }],
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        booking: {
          select: {
            id: true,
            ride: {
              select: {
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

  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: {
        revieweeId: userId,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        booking: {
          select: {
            id: true,
            ride: {
              select: {
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
}