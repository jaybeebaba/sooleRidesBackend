import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';
import { PassengersService } from './passengers.service';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';

@Controller('passengers')
@UseGuards(JwtAuthGuard)
export class PassengersController {
  constructor(private readonly passengersService: PassengersService) {}

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserType) {
    return this.passengersService.getMe(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdatePassengerProfileDto,
  ) {
    return this.passengersService.updateMe(user.id, dto);
  }
}