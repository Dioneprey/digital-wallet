import { expect, describe, it, beforeEach } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { FetchTransactionsUseCase } from './fetch-transactions';
import { makeUser } from 'test/factories/make-user';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import {
  TransactionType,
  TransactionStatus,
} from 'src/domain/wallet/entities/transaction';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;
let sut: FetchTransactionsUseCase;

describe('Fetch transactions', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();
    sut = new FetchTransactionsUseCase(
      inMemoryTransactionRepository,
      inMemoryUserRepository,
    );
  });

  it('should return transactions successfully', async () => {
    const user = makeUser();
    const wallet = makeWallet({ balance: 10000, userId: user.id });

    user.wallet = wallet;

    inMemoryUserRepository.items.push(user);
    inMemoryWalletRepository.items.push(wallet);

    const transaction1 = makeTransaction({
      amount: 5000,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      toWalletId: wallet.id,
    });

    const transaction2 = makeTransaction({
      amount: 2000,
      type: TransactionType.WITHDRAW,
      status: TransactionStatus.PENDING,
      toWalletId: wallet.id,
    });

    inMemoryTransactionRepository.items.push(transaction1, transaction2);

    const result = await sut.execute({
      userId: user.id.toString(),
      pageIndex: 1,
      pageSize: 10,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.transactions).toHaveLength(2);
      expect(result.value.totalCount).toBe(2);
      expect(result.value.totalPages).toBe(1);
    }
  });

  it('should return ResourceNotFoundError if user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-user',
      pageIndex: 1,
      pageSize: 10,
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
