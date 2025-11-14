import { Controller, BadRequestException, Get, Query } from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { FetchNotificationsUseCase } from 'src/domain/wallet/application/use-cases/notification/fetch-notification';
import { NotificationPresenter } from '../../presenters/notification-presenter';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

const fetchNotificationsQuerySchema = z.object({
  pageIndex: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(20),
  onlyUnseen: z.coerce
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

type FetchNotificationsQuerySchema = z.infer<
  typeof fetchNotificationsQuerySchema
>;
const queryValidationPipe = new ZodValidationPipe(
  fetchNotificationsQuerySchema,
);

@ApiTags('notifications')
@Controller('/notifications')
export class FetchNotificationsController {
  constructor(private fetchNotifications: FetchNotificationsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Listar notificações do usuário',
    description:
      'Retorna uma lista paginada de notificações do usuário autenticado, com opção de filtrar apenas não visualizadas.',
  })
  @ApiQuery({
    name: 'pageIndex',
    required: false,
    description: 'Número da página (padrão: 1)',
    schema: { type: 'number', default: 1 },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Quantidade de itens por página (máx: 20, padrão: 20)',
    schema: { type: 'number', default: 20 },
  })
  @ApiQuery({
    name: 'onlyUnseen',
    required: false,
    description:
      'Filtrar apenas notificações não visualizadas. Deve ser "true" para ativar o filtro.',
    schema: { type: 'string', example: 'true' },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações retornada com sucesso',
    schema: {
      example: {
        notifications: [
          {
            id: 'notif-123',
            title: 'Transferência recebida',
            content: 'Você recebeu R$ 150,00 de João Silva',
            readedAt: null,
            createdAt: '2025-11-12T12:00:00.000Z',
            updatedAt: '2025-11-12T12:00:00.000Z',
          },
        ],
        meta: {
          pageIndex: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    schema: {
      example: { message: 'Bad Request' },
    },
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(queryValidationPipe) query: FetchNotificationsQuerySchema,
  ) {
    const userId = user.sub;
    const { pageIndex, pageSize, onlyUnseen } =
      fetchNotificationsQuerySchema.parse(query);

    const result = await this.fetchNotifications.execute({
      pageIndex,
      pageSize,
      userId,
      filters: {
        onlyUnseen,
      },
    });

    if (result.isLeft()) {
      const error = result.value;

      return new BadRequestException(error.message);
    }

    const { notifications, totalCount, totalPages } = result.value;

    return {
      notifications: notifications.map(NotificationPresenter.toHTTP),
      meta: {
        pageIndex,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
}
