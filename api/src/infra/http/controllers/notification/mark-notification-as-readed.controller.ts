import { BadRequestException, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarkNotificationAsReadedUseCase } from 'src/domain/wallet/application/use-cases/notification/mark-notification-as-readed';

@ApiTags('notifications')
@Controller('/notifications/:notificationId/read')
export class MarkNotificationAsReadedController {
  constructor(
    private markNotificationAsReaded: MarkNotificationAsReadedUseCase,
  ) {}

  @Patch()
  @ApiOperation({
    summary: 'Marcar notificação como lida',
    description:
      'Marca uma notificação específica como lida para o usuário autenticado.',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'ID da notificação a ser marcada como lida',
    type: String,
    example: 'notif-123',
  })
  @ApiResponse({
    status: 204,
    description: 'Notificação marcada como lida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida ou notificação não encontrada',
    schema: {
      example: { message: 'Notificação não encontrada' },
    },
  })
  async handle(@Param('notificationId') notificationId: string) {
    const res = await this.markNotificationAsReaded.execute(notificationId);

    if (res.isLeft()) {
      return new BadRequestException(res.value.message);
    }

    return { message: 'Ok' };
  }
}
