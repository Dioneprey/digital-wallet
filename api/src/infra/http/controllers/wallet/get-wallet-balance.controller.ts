import { Controller, HttpCode, BadRequestException, Get } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetWalletBalanceUseCase } from 'src/domain/wallet/application/use-cases/wallet/get-wallet-balance';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { ResourceNotFoundError } from 'src/domain/wallet/application/use-cases/@errors/resource-not-found.error';
import { WalletPresenter } from '../../presenters/wallet-presenter';

@ApiTags('wallet')
@Controller('/wallet')
export class GetWalletBalanceController {
  constructor(private getWalletBalance: GetWalletBalanceUseCase) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get wallet balance',
    description: 'Busca o saldo da carteira do usuário logado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna a carteira',
    schema: {
      example: {
        wallet: {
          id: 'wallet-123',
          userId: 'user-456',
          balance: 10000, // valor em centavos
          createdAt: '2025-11-10T14:00:00.000Z',
          updatedAt: '2025-11-10T14:05:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: {
      example: { message: 'Bad request' },
    },
  })
  async handle(@CurrentUser() user: UserPayload) {
    const result = await this.getWalletBalance.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          return { wallet: null };
        default:
          return new BadRequestException(error.message);
      }
    }

    const wallet = result.value.wallet;

    return { wallet: WalletPresenter.toHTTP(wallet) };
  }
}
