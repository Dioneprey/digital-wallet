import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from 'src/infra/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('/me')
export class GetMeController {
  constructor() {}

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
    return user;
  }
}
