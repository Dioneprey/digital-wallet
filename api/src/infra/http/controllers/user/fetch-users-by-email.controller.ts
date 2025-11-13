import {
  Controller,
  Query,
  HttpCode,
  BadRequestException,
  ConflictException,
  Get,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceAlreadyExists } from 'src/domain/wallet/application/use-cases/@errors/resource-already-exists.error';
import { FetchUsersByEmailUseCase } from 'src/domain/wallet/application/use-cases/user/fetch-users-by-email';
import { UserPresenter } from '../../presenters/user-presenter';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';

const FetchUsersByEmailQuerySchema = z.object({
  email: z.string(),
  pageSize: z.coerce.number().min(1).max(20).default(20),
});

type FetchUsersByEmailQuerySchema = z.infer<
  typeof FetchUsersByEmailQuerySchema
>;
const queryValidationPipe = new ZodValidationPipe(FetchUsersByEmailQuerySchema);

@ApiTags('users')
@Controller('/users')
export class FetchUsersByEmailController {
  constructor(private fetchUsersByEmail: FetchUsersByEmailUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Fetch users by email',
    description: 'Busca usuários pelo email',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Filtrar usuários por email',
    schema: { type: 'string' },
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Quantidade de itens por página (máx: 20, padrão: 20)',
    schema: { type: 'number', default: 20 },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: {
        transactions: [
          {
            id: '123',
            name: 'João da Silva',
            email: 'joao.silva@example.com',
            createdAt: '2025-11-12T18:00:00.000Z',
            updatedAt: '2025-11-12T18:30:00.000Z',
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
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
  async handle(
    @Query(queryValidationPipe) query: FetchUsersByEmailQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { email, pageSize } = query;

    const result = await this.fetchUsersByEmail.execute({
      email,
      pageSize,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { users, totalCount, totalPages } = result.value;

    return {
      users: users.map(UserPresenter.toHTTP),
      meta: {
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
}
