import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { DriversService } from './drivers.service';
import { ApplyDriverDto } from './dto/apply-driver.dto';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('apply')
  apply(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: ApplyDriverDto,
  ) {
    return this.driversService.apply(user.id, dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getMe(user.id);
  }
}