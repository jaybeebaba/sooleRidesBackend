import { Body, Controller, Get, Post, UseGuards, Param, Patch } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { DriversService } from './drivers.service';
import { ApplyDriverDto } from './dto/apply-driver.dto';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getDashboard(user.id);
  }
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

  @Patch('me')
  updateMe(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateDriverProfileDto,
  ) {
    return this.driversService.updateMe(user.id, dto);
  }

  @Get('rides')
  getMyRides(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getMyRides(user.id);
  }

  @Get('rides/active')
  getActiveRides(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getActiveRides(user.id);
  }

  @Patch('rides/:id/start')
  startRide(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.driversService.startRide(user.id, id);
  }

  @Patch('rides/:id/complete')
  completeRide(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.driversService.completeRide(user.id, id);
  }


  @Patch('rides/:id/cancel')
  cancelRide(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.driversService.cancelRide(user.id, id);
  }

  @Get('rides/:id/passengers')
  getRidePassengers(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.driversService.getRidePassengers(user.id, id);
  }


  @Get('rides/:id')
  getRideById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.driversService.getRideById(user.id, id);
  }

  @Get('bookings')
  getMyBookings(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getMyBookings(user.id);
  }

  @Get('bookings/pending')
  getPendingBookings(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getPendingBookings(user.id);
  }

  @Get('bookings/:id')
  getBookingById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.driversService.getBookingById(user.id, id);
  }

  @Patch('bookings/:id/accept')
  acceptBooking(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.driversService.acceptBooking(user.id, id);
  }

  @Patch('bookings/:id/reject')
  rejectBooking(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.driversService.rejectBooking(user.id, id);
  }

  @Get('earnings/summary')
  getEarningsSummary(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getEarningsSummary(user.id);
  }

  @Get('earnings/rides/:rideId')
  getRideEarnings(
    @CurrentUser() user: CurrentUserType,
    @Param('rideId') rideId: string,
  ) {
    return this.driversService.getRideEarnings(user.id, rideId);
  }

  @Get('earnings')
  getEarnings(@CurrentUser() user: CurrentUserType) {
    return this.driversService.getEarnings(user.id);
  }
}