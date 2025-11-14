import { expect } from 'vitest';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { ProcessDepositTransactionUseCase } from './process-deposit-transaction';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { FakeCreateNotificationSchedule } from 'test/schedules/fake-create-notification-schedule';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeCreateNotificationSchedule: FakeCreateNotificationSchedule;

let sut: ProcessDepositTransactionUseCase;

describe('Process deposit transaction', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeCreateNotificationSchedule = new FakeCreateNotificationSchedule();
    sut = new ProcessDepositTransactionUseCase(
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
      fakeCreateNotificationSchedule,
    );
  });

  it('should process a pending deposit transaction and update the wallet balance', async () => {
    const wallet = makeWallet({ balance: 0 });
    inMemoryWalletRepository.items.push(wallet);

    const transaction = makeTransaction({
      type: TransactionType.DEPOSIT,
      amount: 5000,
      status: TransactionStatus.PENDING,
      toWalletId: wallet.id,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      toWalletId: wallet.id.toString(),
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const updatedWallet = inMemoryWalletRepository.items[0];
    const updatedTransaction = inMemoryTransactionRepository.items[0];

    expect(updatedWallet.balance).toBe(5000);
    expect(updatedTransaction.status).toBe('COMPLETED');
  });

  it('should return left if transaction does not exist', async () => {
    const wallet = makeWallet();
    inMemoryWalletRepository.items.push(wallet);

    const result = await sut.execute({
      transactionId: 'non-existent',
      toWalletId: wallet.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should return left if wallet does not exist', async () => {
    const transaction = makeTransaction({ amount: 1000 });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      toWalletId: 'non-existent',
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should return left if transaction is not pending', async () => {
    const wallet = makeWallet();
    inMemoryWalletRepository.items.push(wallet);

    const transaction = makeTransaction({
      amount: 1000,
      status: TransactionStatus.COMPLETED,
      toWalletId: wallet.id,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      toWalletId: wallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceInvalidError);
  });
});
