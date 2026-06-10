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

import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard, FullyVerifiedGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getMyConversations(@CurrentUser() user: CurrentUserType) {
    return this.messagesService.getMyConversations(user.id);
  }

  @Post('conversations')
  createConversation(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(user.id, dto);
  }

  @Get('conversations/:id/messages')
  getConversationMessages(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.messagesService.getConversationMessages(user.id, id);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.id, id, dto.content);
  }

  @Patch('conversations/:id/read')
  markConversationAsRead(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.messagesService.markConversationAsRead(user.id, id);
  }
}