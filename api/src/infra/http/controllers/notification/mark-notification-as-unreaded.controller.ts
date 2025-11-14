import { BadRequestException, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarkNotificationAsUnreadedUseCase } from 'src/domain/wallet/application/use-cases/notification/mark-notification-as-unreaded';

@ApiTags('notifications')
@Controller('/notifications/:notificationId/unread')
export class MarkNotificationAsUnreadedController {
  constructor(
    private markNotificationAsUnreaded: MarkNotificationAsUnreadedUseCase,
  ) {}

  @Patch()
  @ApiOperation({
    summary: 'Marcar notificação como não lida',
    description:
      'Marca uma notificação específica como não lida para o usuário autenticado.',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'ID da notificação a ser marcada como não lida',
    type: String,
    example: 'notif-123',
  })
  @ApiResponse({
    status: 204,
    description: 'Notificação marcada como não lida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida ou notificação não encontrada',
    schema: {
      example: { message: 'Notificação não encontrada' },
    },
  })
  async handle(@Param('notificationId') notificationId: string) {
    const res = await this.markNotificationAsUnreaded.execute(notificationId);

    if (res.isLeft()) {
      return new BadRequestException(res.value.message);
    }

    return { message: 'Ok' };
  }
}
