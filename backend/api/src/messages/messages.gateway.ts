import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { MessagesService } from './messages.service';

type AuthenticatedSocket = Socket & {
  user?: {
    id: string;
    role: string;
  };
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'access_secret',
      });

      client.user = {
        id: payload.sub,
        role: payload.role,
      };

      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('join_conversation')
  async joinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.user) {
      client.disconnect();
      return;
    }

    await this.messagesService.ensureParticipant(
      client.user.id,
      data.conversationId,
    );

    client.join(`conversation:${data.conversationId}`);

    return {
      event: 'joined_conversation',
      conversationId: data.conversationId,
    };
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    if (!client.user) {
      client.disconnect();
      return;
    }

    const message = await this.messagesService.sendMessage(
      client.user.id,
      data.conversationId,
      data.content,
    );

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('new_message', message);

    return {
      event: 'message_sent',
      message,
    };
  }

  @SubscribeMessage('mark_read')
  async markRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!client.user) {
      client.disconnect();
      return;
    }

    await this.messagesService.markConversationAsRead(
      client.user.id,
      data.conversationId,
    );

    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('messages_read', {
        conversationId: data.conversationId,
        userId: client.user.id,
      });

    return {
      event: 'marked_read',
      conversationId: data.conversationId,
    };
  }

  @SubscribeMessage('typing')
  async typing(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    if (!client.user) {
      client.disconnect();
      return;
    }

    await this.messagesService.ensureParticipant(
      client.user.id,
      data.conversationId,
    );

    client.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      userId: client.user.id,
      isTyping: data.isTyping,
    });
  }
}