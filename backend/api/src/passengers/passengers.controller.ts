import { Body, Controller, Get, Param, Patch, UseGuards, Post, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';
import { PassengersService } from './passengers.service';
import { UpdatePassengerProfileDto } from './dto/update-passenger-profile.dto';
import { CreateSavedRouteDto } from './dto/create-saved-route.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';

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
@Get('dashboard')
getDashboard(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getDashboard(user.id);
}
  @Get('saved-routes')
getSavedRoutes(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getSavedRoutes(user.id);
}

@Post('saved-routes')
createSavedRoute(
  @CurrentUser() user: CurrentUserType,
  @Body() dto: CreateSavedRouteDto,
) {
  return this.passengersService.createSavedRoute(user.id, dto);
}

@Delete('saved-routes/:id')
deleteSavedRoute(
  @CurrentUser() user: CurrentUserType,
  @Param('id') id: string,
) {
  return this.passengersService.deleteSavedRoute(user.id, id);
}

@Get('emergency-contacts')
getEmergencyContacts(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getEmergencyContacts(user.id);
}

@Post('emergency-contacts')
createEmergencyContact(
  @CurrentUser() user: CurrentUserType,
  @Body() dto: CreateEmergencyContactDto,
) {
  return this.passengersService.createEmergencyContact(user.id, dto);
}

@Delete('emergency-contacts/:id')
deleteEmergencyContact(
  @CurrentUser() user: CurrentUserType,
  @Param('id') id: string,
) {
  return this.passengersService.deleteEmergencyContact(user.id, id);
}

@Get('my-trips')
getMyTrips(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getMyTrips(user.id);
}

@Get('upcoming-trips')
getUpcomingTrips(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getUpcomingTrips(user.id);
}

@Get('completed-trips')
getCompletedTrips(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getCompletedTrips(user.id);
}

@Get('cancelled-trips')
getCancelledTrips(@CurrentUser() user: CurrentUserType) {
  return this.passengersService.getCancelledTrips(user.id);
}

@Get('my-trips/:id')
getMyTripById(
  @CurrentUser() user: CurrentUserType,
  @Param('id') id: string,
) {
  return this.passengersService.getMyTripById(user.id, id);
}
  
}