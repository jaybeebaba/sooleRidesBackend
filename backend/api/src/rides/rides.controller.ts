import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { SearchRidesDto } from './dto/search-rides.dto';
import { UpdateRideDto } from './dto/update-ride.dto';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateRideDto) {
    return this.ridesService.create(user.id, dto);
  }

  @Get('my-rides')
  @UseGuards(JwtAuthGuard)
  getMyRides(@CurrentUser() user: CurrentUserType) {
    return this.ridesService.getMyRides(user.id);
  }

  @Get('search')
  search(@Query() dto: SearchRidesDto) {
    return this.ridesService.search(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateRideDto,
  ) {
    return this.ridesService.update(user.id, id, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.ridesService.cancel(user.id, id);
  }
}