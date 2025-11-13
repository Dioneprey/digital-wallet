import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common';

import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeUseCase } from 'src/domain/wallet/application/use-cases/user/me';
import { ResourceNotFoundError } from 'src/domain/wallet/application/use-cases/@errors/resource-not-found.error';
import { UserPresenter } from '../../presenters/user-presenter';

@ApiTags('users')
@Controller('/me')
export class GetMeController {
  constructor(private meUseCase: MeUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retorna os dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado retornado com sucesso',
    schema: {
      example: {
        id: '123',
        name: 'João da Silva',
        email: 'joao.silva@example.com',
        createdAt: '2025-11-12T18:00:00.000Z',
        updatedAt: '2025-11-12T18:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não autenticado',
    schema: {
      example: { message: 'Forbidden resource' },
    },
  })
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.meUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          return new NotFoundException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { user: userData } = result.value;

    return { user: UserPresenter.toHTTP(userData) };
  }
}
