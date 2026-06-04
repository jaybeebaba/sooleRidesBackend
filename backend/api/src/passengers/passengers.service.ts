import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';
import { NotFoundException } from '@nestjs/common';
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

}