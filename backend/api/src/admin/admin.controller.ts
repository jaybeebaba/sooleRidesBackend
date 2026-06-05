import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('dashboard')
  dashboard(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'Welcome Admin',
      user,
    };
  }

  @Get('users')
  async getAllUsers() {
    return this.prisma.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
@Get('drivers')
getAllDrivers() {
  return this.adminService.getAllDrivers();
}

@Get('drivers/pending')
  getPendingDrivers() {
    return this.adminService.getPendingDrivers();
  }
  
@Get('drivers/:id')
getDriverById(@Param('id') id: string) {
  return this.adminService.getDriverById(id);
}


@Patch('drivers/:id/suspend')
suspendDriver(@Param('id') id: string) {
  return this.adminService.suspendDriver(id);
}

@Patch('drivers/:id/unsuspend')
unsuspendDriver(@Param('id') id: string) {
  return this.adminService.unsuspendDriver(id);
}
  
  @Patch('drivers/:id/approve')
  approveDriver(@Param('id') id: string) {
    return this.adminService.approveDriver(id);
  }

  @Patch('drivers/:id/reject')
  rejectDriver(@Param('id') id: string) {
    return this.adminService.rejectDriver(id);
  }

  @Get('vehicles/pending')
  getPendingVehicles() {
    return this.adminService.getPendingVehicles();
  }

  @Patch('vehicles/:id/approve')
  approveVehicle(@Param('id') id: string) {
    return this.adminService.approveVehicle(id);
  }

  @Patch('vehicles/:id/reject')
  rejectVehicle(@Param('id') id: string) {
    return this.adminService.rejectVehicle(id);
  }
}