import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Transaction,
  TransactionProps,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { PrismaTransactionMapper } from 'src/infra/database/prisma/mappers/prisma-transaction.mapper';
// import { PrismaTransactionMapper } from 'src/infra/database/prisma/mappers/prisma-transaction-mapper';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

export function makeTransaction(
  override: Partial<TransactionProps> = {},
  id?: UniqueEntityID,
) {
  const transaction = Transaction.create(
    {
      amount: 0,
      type: override.type || TransactionType.DEPOSIT,
      ...override,
    },
    id,
  );

  return transaction;
}

@Injectable()
export class TransactionFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaTransaction(
    data: Partial<TransactionProps> = {},
  ): Promise<Transaction> {
    const transaction = makeTransaction(data);

    await this.prisma.transaction.create({
      data: PrismaTransactionMapper.toPrisma(transaction),
    });

    return transaction;
  }
}
