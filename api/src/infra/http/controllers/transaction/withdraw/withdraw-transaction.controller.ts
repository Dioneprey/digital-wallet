import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceAlreadyExists } from 'src/domain/wallet/application/use-cases/@errors/resource-already-exists.error';
import { CreateWithdrawTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/withdraw/create-withdraw-transaction';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { TransactionPresenter } from 'src/infra/http/presenters/transaction-presenter';

const CreateWithdrawTransactionBodySchema = z.object({
  amount: z.number(),
  description: z.string().optional(),
});

type CreateWithdrawTransactionBodySchema = z.infer<
  typeof CreateWithdrawTransactionBodySchema
>;
const bodyValidationPipe = new ZodValidationPipe(
  CreateWithdrawTransactionBodySchema,
);

@ApiTags('transactions')
@Controller('/transactions/withdraw')
export class CreateWithdrawTransactionController {
  constructor(
    private createWithdrawTransaction: CreateWithdrawTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create withdraw transaction',
    description: 'Cria uma transação de saque na carteira do usuário',
  })
  @ApiBody({
    description: 'Dados para criação de saque',
    schema: {
      example: {
        amount: 5000, // valor em centavos
        description: 'Saque para pagamento',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Saque criado com sucesso',
    schema: {
      example: {
        transaction: {
          id: 'txn-123',
          type: 'WITHDRAW',
          amount: 5000,
          description: 'Saque para pagamento',
          status: 'PENDING',
          toWalletId: 'wallet-123',
          createdAt: '2025-11-10T14:00:00.000Z',
          updatedAt: '2025-11-10T14:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou carteira não encontrados',
    schema: { example: { message: 'Resource not found' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
  async handle(
    @Body(bodyValidationPipe) body: CreateWithdrawTransactionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { amount, description } = body;

    const result = await this.createWithdrawTransaction.execute({
      amount,
      userId: user.sub,
      description,
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

    const { transaction } = result.value;

    return { transaction: TransactionPresenter.toHTTP(transaction) };
  }
}
