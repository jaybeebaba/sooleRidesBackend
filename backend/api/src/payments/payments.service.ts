import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initialize(userId: string, dto: InitializePaymentDto) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: dto.bookingId,
        passengerId: userId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PAYMENT_PENDING) {
      throw new BadRequestException('Booking is not awaiting payment');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: {
        bookingId: booking.id,
      },
    });

    if (existingPayment) {
      return {
        message: 'Payment already initialized',
        payment: existingPayment,
        authorizationUrl: `https://checkout.paystack.com/mock-${existingPayment.reference}`,
      };
    }

    const reference = `SOOLE-${Date.now()}-${Math.floor(
      Math.random() * 100000,
    )}`;

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        reference,
        provider: 'PAYSTACK',
        status: PaymentStatus.PENDING,
      },
    });

    return {
      message: 'Payment initialized successfully',
      payment,
      authorizationUrl: `https://checkout.paystack.com/mock-${reference}`,
    };
  }

  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        booking: {
          passengerId: userId,
        },
      },
      select: {
        id: true,
        amount: true,
        reference: true,
        provider: true,
        status: true,
        createdAt: true,
        booking: {
          select: {
            id: true,
            seatsBooked: true,
            totalAmount: true,
            serviceFee: true,
            status: true,
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

  async getPaymentById(userId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        booking: {
          passengerId: userId,
        },
      },
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

  async mockConfirmPayment(userId: string, paymentId: string) {
  const payment = await this.prisma.payment.findFirst({
    where: {
      id: paymentId,
      booking: {
        passengerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          ride: true,
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundException('Payment not found');
  }

  if (payment.status === PaymentStatus.SUCCESSFUL) {
    return {
      message: 'Payment already confirmed',
      payment,
    };
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new BadRequestException('Payment cannot be confirmed');
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESSFUL,
      },
    });

    const updatedBooking = await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });

    await tx.notification.create({
      data: {
        userId: payment.booking.passengerId,
        title: 'Payment confirmed',
        body: `Your payment for ${payment.booking.ride.origin} to ${payment.booking.ride.destination} has been confirmed.`,
        type: 'PAYMENT',
      },
    });

    await tx.notification.create({
      data: {
        userId: payment.booking.ride.driverId,
        title: 'Booking payment confirmed',
        body: `A passenger has completed payment for your ${payment.booking.ride.origin} to ${payment.booking.ride.destination} ride.`,
        type: 'PAYMENT',
      },
    });

    return {
      message: 'Payment confirmed successfully',
      payment: updatedPayment,
      booking: updatedBooking,
    };
  });
}
}