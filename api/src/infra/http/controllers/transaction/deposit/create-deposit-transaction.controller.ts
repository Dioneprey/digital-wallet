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
import { CreateDepositTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/deposit/create-deposit-transaction';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { TransactionPresenter } from 'src/infra/http/presenters/transaction-presenter';

const CreateDepositTransactionBodySchema = z.object({
  amount: z.number(),
  description: z.string().optional(),
});

type CreateDepositTransactionBodySchema = z.infer<
  typeof CreateDepositTransactionBodySchema
>;
const bodyValidationPipe = new ZodValidationPipe(
  CreateDepositTransactionBodySchema,
);

@ApiTags('transactions')
@Controller('/transactions/deposit')
export class CreateDepositTransactionController {
  constructor(
    private createDepositTransaction: CreateDepositTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create deposit transaction',
    description: 'Cria uma transação de depósito na carteira do usuário',
  })
  @ApiBody({
    description: 'Dados para criação de depósito',
    schema: {
      example: {
        amount: 5000, // valor em centavos
        description: 'Depósito inicial',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Depósito criado com sucesso',
    schema: {
      example: {
        transaction: {
          id: 'txn-123',
          type: 'DEPOSIT',
          amount: 5000,
          description: 'Depósito inicial',
          status: 'PENDING',
          toWalletId: 'wallet-456',
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
    @Body(bodyValidationPipe) body: CreateDepositTransactionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { amount, description } = body;

    const result = await this.createDepositTransaction.execute({
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
