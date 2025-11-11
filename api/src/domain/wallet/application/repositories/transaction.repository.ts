import { PaginationProps, PaginationResponse } from 'src/core/types/pagination';
import {
  Transaction,
  TransactionKey,
  TransactionType,
} from '../../entities/transaction';
import { Wallet } from '../../entities/wallet';

export interface TransactionRepositoryFindByUniqueFieldProps {
  key: TransactionKey;
  value: string;
}

export interface TransactionRepositoryFindManyProps
  extends PaginationProps<{
    type?: TransactionType;
    walletId?: string;
  }> {}

export abstract class TransactionRepository {
  abstract findByUniqueField({
    key,
    value,
  }: TransactionRepositoryFindByUniqueFieldProps): Promise<Transaction | null>;

  abstract findMany({
    pageIndex,
    pageSize,
    filters,
  }: TransactionRepositoryFindManyProps): Promise<
    PaginationResponse<Transaction>
  >;

  abstract create(transaction: Transaction): Promise<Transaction>;

  abstract applyTransactionToWallet(data: {
    wallet: Wallet;
    transaction: Transaction;
  }): Promise<{
    wallet: Wallet;
    transaction: Transaction;
  }>;
  abstract applyTransferBetweenWallets(data: {
    fromWallet: Wallet;
    toWallet: Wallet;
    transaction: Transaction;
  }): Promise<{
    fromWallet: Wallet;
    toWallet: Wallet;
    transaction: Transaction;
  }>;
  abstract save(transaction: Transaction): Promise<Transaction>;
  abstract delete(transaction: Transaction): Promise<void>;
}
