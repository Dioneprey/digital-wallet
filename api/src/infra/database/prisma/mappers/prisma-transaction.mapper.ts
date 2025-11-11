import { Prisma, Transaction as PrismaTransaction } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  ReversalInitiator,
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';

export type TransactionWithInclude = PrismaTransaction & {};

export class PrismaTransactionMapper {
  static toDomain(raw: TransactionWithInclude): Transaction {
    return Transaction.create(
      {
        ...raw,
        status: raw.status
          ? TransactionStatus[raw.status]
          : TransactionStatus.PENDING,
        reversalInitiator: raw.reversalInitiator
          ? ReversalInitiator[raw.reversalInitiator]
          : ReversalInitiator.USER,
        type: raw.type ? TransactionType[raw.type] : TransactionType.DEPOSIT,
        fromWalletId: raw.fromWalletId
          ? new UniqueEntityID(raw.fromWalletId)
          : undefined,
        toWalletId: raw.toWalletId
          ? new UniqueEntityID(raw.toWalletId)
          : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    transaction: Transaction,
  ): Prisma.TransactionUncheckedCreateInput {
    return {
      id: transaction.id.toString(),
      fromWalletId: transaction?.fromWalletId?.toString(),
      toWalletId: transaction?.toWalletId?.toString(),
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      reversalInitiator: transaction.reversalInitiator,
      reversalReason: transaction.reversalReason,
      reversed: transaction.reversed,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
