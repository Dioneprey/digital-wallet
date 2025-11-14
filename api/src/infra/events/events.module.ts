import { forwardRef, Module } from '@nestjs/common';
import { NotificationGateway } from './gateways/socket/notification.gateway';
import { SocketService } from './gateways/socket/socket.service';
import { SocketGateway } from './gateways/socket/socket.gateway';
import { HttpModule } from '../http/http.module';

@Module({
  imports: [forwardRef(() => HttpModule)],
  providers: [NotificationGateway, SocketService, SocketGateway],
  exports: [NotificationGateway],
})
export class EventsModule {}
