import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMine(@CurrentUser() user: CurrentUserType) {
    return this.notificationsService.getMine(user.id);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: CurrentUserType) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: CurrentUserType) {
    return this.notificationsService.markAllAsRead(user.id);
  }
  @Patch(':id/read')
  markAsRead(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  
}