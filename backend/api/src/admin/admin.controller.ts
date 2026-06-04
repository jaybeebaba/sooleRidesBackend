import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  dashboard() {
    return {
      message: 'Welcome Admin',
    };
  }
}