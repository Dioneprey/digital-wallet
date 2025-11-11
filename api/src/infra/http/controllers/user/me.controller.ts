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

@ApiTags('user')
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
        sub: 'user-id-123',
        iat: 1762824338,
        exp: 1762825238,
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
    console.log(result.value);

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
