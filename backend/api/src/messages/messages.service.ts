import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    if (userId === dto.participantId) {
      throw new BadRequestException('You cannot start a conversation with yourself');
    }

    const participant = await this.prisma.user.findUnique({
      where: { id: dto.participantId },
      select: { id: true },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (dto.rideId) {
      const ride = await this.prisma.ride.findUnique({
        where: { id: dto.rideId },
        select: { id: true },
      });

      if (!ride) {
        throw new NotFoundException('Ride not found');
      }
    }

    return this.prisma.conversation.create({
      data: {
        rideId: dto.rideId,
        participants: {
          create: [{ userId }, { userId: dto.participantId }],
        },
      },
      include: {
        ride: true,
        participants: {
          include: {
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
    });
  }

  async getMyConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        ride: {
          select: {
            id: true,
            origin: true,
            destination: true,
            departureTime: true,
          },
        },
        participants: {
          include: {
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
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);

    return this.prisma.message.findMany({
      where: { conversationId },
      select: {
        id: true,
        content: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
  await this.ensureParticipant(userId, conversationId);

  return this.prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const otherParticipants = await tx.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: {
          not: userId,
        },
      },
      select: {
        userId: true,
      },
    });

    for (const participant of otherParticipants) {
      await tx.notification.create({
        data: {
          userId: participant.userId,
          title: 'New message',
          body: `${message.sender.fullName ?? 'Someone'} sent you a message.`,
          type: 'MESSAGE',
        },
      });
    }

    return message;
  });
}

  async markConversationAsRead(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      message: 'Conversation marked as read',
    };
  }

  async ensureParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return participant;
  }
}