import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketService } from './socket.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: '*',
  namespace: '/api',
})
export class NotificationGateway {
  @WebSocketServer() server: Server;
  private logger = new Logger(NotificationGateway.name);

  constructor(private readonly socketService: SocketService) {}

  newNotification({ userId }: { userId: string }): void {
    this.server.to(userId).emit('new-notification', { refresh: true });
  }

  newTransaction({ userId }: { userId: string }): void {
    this.server.to(userId).emit('new-transaction', { refresh: true });
  }
}
