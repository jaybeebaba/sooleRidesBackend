import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    if (userId === dto.reportedUserId) {
      throw new BadRequestException('You cannot report yourself');
    }

    const reportedUser = await this.prisma.user.findUnique({
      where: { id: dto.reportedUserId },
      select: { id: true },
    });

    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    return this.prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId: dto.reportedUserId,
        reason: dto.reason.trim(),
        details: dto.details?.trim(),
      },
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async getMyReports(userId: string) {
    return this.prisma.report.findMany({
      where: {
        reporterId: userId,
      },
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}