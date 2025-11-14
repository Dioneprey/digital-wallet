import { expect } from 'vitest';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ProcessWithdrawTransactionUseCase } from './process-withdraw-deposit-transaction';
import { FakeCreateNotificationSchedule } from 'test/schedules/fake-create-notification-schedule';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeCreateNotificationSchedule: FakeCreateNotificationSchedule;
let sut: ProcessWithdrawTransactionUseCase;

describe('Process withdraw transaction', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeCreateNotificationSchedule = new FakeCreateNotificationSchedule();
    sut = new ProcessWithdrawTransactionUseCase(
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
      fakeCreateNotificationSchedule,
    );
  });

  it('should process a withdraw transaction and update the wallet balance', async () => {
    const wallet = makeWallet(
      { balance: 10000 },
      new UniqueEntityID('wallet-1'),
    );
    const transaction = makeTransaction(
      {
        type: TransactionType.WITHDRAW,
        amount: 5000,
        status: TransactionStatus.PENDING,
      },
      new UniqueEntityID('tx-1'),
    );

    inMemoryWalletRepository.items.push(wallet);
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: wallet.id.toString(),
    });

    expect(result.isLeft()).toBeFalsy();
    expect(transaction.status).toBe(TransactionStatus.COMPLETED);
  });

  it('should return error if transaction does not exist', async () => {
    const result = await sut.execute({
      transactionId: 'non-existing-tx',
      fromWalletId: 'wallet-1',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if wallet does not exist', async () => {
    const transaction = makeTransaction({
      type: TransactionType.WITHDRAW,
      amount: 1000,
      status: TransactionStatus.PENDING,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: 'non-existing-wallet',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if transaction is not pending', async () => {
    const wallet = makeWallet({ balance: 10000 });
    const transaction = makeTransaction({
      type: TransactionType.WITHDRAW,
      amount: 5000,
      status: TransactionStatus.COMPLETED,
    });
    inMemoryWalletRepository.items.push(wallet);
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: wallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceInvalidError);
  });

  it('should return error if wallet has insufficient balance', async () => {
    const wallet = makeWallet({ balance: 1000 });
    const transaction = makeTransaction({
      type: TransactionType.WITHDRAW,
      amount: 5000,
      status: TransactionStatus.PENDING,
    });
    inMemoryWalletRepository.items.push(wallet);
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: wallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InsufficienteBalanceError);
  });
});
