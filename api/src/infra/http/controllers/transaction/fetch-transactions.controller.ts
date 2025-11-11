import { Controller, BadRequestException, Get, Query } from '@nestjs/common';

import { z } from 'zod';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionType } from 'src/domain/wallet/entities/transaction';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { FetchTransactionsUseCase } from 'src/domain/wallet/application/use-cases/transactions/fetch-transactions';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { TransactionPresenter } from '../../presenters/transaction-presenter';

const fetchTransactionsQuerySchema = z.object({
  pageIndex: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(20),
  type: z.enum(TransactionType).optional(),
});
type FetchTransactionsQuerySchema = z.infer<
  typeof fetchTransactionsQuerySchema
>;
const queryValidationPipe = new ZodValidationPipe(fetchTransactionsQuerySchema);

@ApiTags('transactions')
@Controller('/transactions')
export class FetchTransactionsController {
  constructor(private fetchTransactions: FetchTransactionsUseCase) {}

  @Get()
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: 'Fetch all transactions',
    description:
      'Retorna uma lista paginada de transações, com opção de filtrar por tipo',
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
    name: 'type',
    required: false,
    description: 'Filtrar transações por tipo',
    schema: { type: 'string', enum: Object.values(TransactionType) },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de transações retornada com sucesso',
    schema: {
      example: {
        transactions: [
          {
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
    schema: { example: { message: 'Bad Request' } },
  })
  async handle(
    @Query(queryValidationPipe) query: FetchTransactionsQuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { pageIndex, pageSize, type } = query;

    const result = await this.fetchTransactions.execute({
      type,
      pageIndex,
      pageSize,
      userId: user.sub,
    });

    if (result.isLeft()) {
      return new BadRequestException();
    }

    const { transactions, totalCount, totalPages } = result.value;

    return {
      transactions: transactions.map(TransactionPresenter.toHTTP),
      meta: {
        pageIndex: pageIndex ?? 0,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }
}
