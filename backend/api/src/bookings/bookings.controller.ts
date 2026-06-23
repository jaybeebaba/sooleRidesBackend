import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { FullyVerifiedGuard } from '../common/guards/fully-verified.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Query } from '@nestjs/common';
@Controller('bookings')
@UseGuards(JwtAuthGuard, FullyVerifiedGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  // @Get('my-bookings')
  // getMyBookings(@CurrentUser() user: CurrentUserType) {
  //   return this.bookingsService.getMyBookings(user.id);
  // }
  @Get('my-bookings')
  getMyBookings(
    @CurrentUser() user: CurrentUserType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingsService.getMyBookings(
      user.id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }
  @Get(':id')
  getBookingById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getBookingById(user.id, id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.bookingsService.cancel(user.id, id);
  }
}