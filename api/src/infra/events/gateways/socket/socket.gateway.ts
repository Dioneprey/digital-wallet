import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: '*',
  namespace: '/api',
})
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly socketService: SocketService) {}

  handleConnection(socket: Socket): void {
    this.socketService.handleConnection(socket);
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() payload: { userId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(payload.userId);
    this.socketService.handleJoin(payload.userId, client);
  }
}
