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
import { CreateTransferTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/transfer/create-transfer-transaction';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { TransactionPresenter } from 'src/infra/http/presenters/transaction-presenter';

const CreateTransferTransactionBodySchema = z.object({
  toUserId: z.string(),
  amount: z.number(),
  description: z.string().optional(),
});

type CreateTransferTransactionBodySchema = z.infer<
  typeof CreateTransferTransactionBodySchema
>;
const bodyValidationPipe = new ZodValidationPipe(
  CreateTransferTransactionBodySchema,
);

@ApiTags('transactions')
@Controller('/transactions/transfer')
export class CreateTransferTransactionController {
  constructor(
    private createTransferTransaction: CreateTransferTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create transfer transaction',
    description: 'Cria uma transação de transferência entre usuários',
  })
  @ApiBody({
    description: 'Dados para criação de transferência',
    schema: {
      example: {
        toUserId: 'user-2',
        amount: 5000, // valor em centavos
        description: 'Pagamento de serviço',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transferência criada com sucesso',
    schema: {
      example: {
        transaction: {
          id: 'txn-123',
          type: 'TRANSFER',
          amount: 5000,
          description: 'Pagamento de serviço',
          status: 'PENDING',
          fromWalletId: 'wallet-123',
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
    @Body(bodyValidationPipe) body: CreateTransferTransactionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { toUserId, amount, description } = body;

    const result = await this.createTransferTransaction.execute({
      amount,
      toUserId,
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
