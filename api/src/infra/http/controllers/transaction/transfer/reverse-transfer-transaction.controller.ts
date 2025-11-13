import {
  Controller,
  Body,
  HttpCode,
  BadRequestException,
  ConflictException,
  Param,
  Patch,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../../pipes/zod-validation.pipe';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceAlreadyExists } from 'src/domain/wallet/application/use-cases/@errors/resource-already-exists.error';
import { CurrentUser } from 'src/infra/auth/current-user.decorator';
import { UserPayload } from 'src/core/types/user-payload';
import { ReverseTransferTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/transfer/reverse-transfer-transaction';

const ReverseTransferTransactionBodySchema = z.object({
  reason: z.string().optional(),
});

type ReverseTransferTransactionBodySchema = z.infer<
  typeof ReverseTransferTransactionBodySchema
>;
const bodyValidationPipe = new ZodValidationPipe(
  ReverseTransferTransactionBodySchema,
);

@ApiTags('transactions')
@Controller('/transactions/:transactionId/reverse')
export class ReverseTransferTransactionController {
  constructor(
    private reverseTransferTransaction: ReverseTransferTransactionUseCase,
  ) {}

  @Patch()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reverse transfer transaction',
    description: 'Reverte uma transação de transferência entre usuários',
  })
  @ApiBody({
    description: 'Motivo para reversão da transferência',
    schema: {
      example: {
        reason: 'Usuário solicitou cancelamento',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transferência revertida com sucesso',
    schema: {
      example: { message: 'Reversão de transferência sendo processada' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transação ou carteira não encontrados',
    schema: { example: { message: 'Resource not found' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Reversão já realizada',
    schema: { example: { message: 'Resource already exists' } },
  })
  async handle(
    @Body(bodyValidationPipe) body: ReverseTransferTransactionBodySchema,
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const { reason } = body;

    const result = await this.reverseTransferTransaction.execute({
      transactionId: transactionId,
      userId: user.sub,
      reason,
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

    return { message: 'Reversão de transferência sendo processada' };
  }
}
