import { expect } from 'vitest';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { ProcessTransferTransactionUseCase } from './process-transfer-deposit-transaction';
import { FakeCreateNotificationSchedule } from 'test/schedules/fake-create-notification-schedule';
import { makeUser } from 'test/factories/make-user';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeCreateNotificationSchedule: FakeCreateNotificationSchedule;
let sut: ProcessTransferTransactionUseCase;

describe('Process transfer transaction', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeCreateNotificationSchedule = new FakeCreateNotificationSchedule();
    sut = new ProcessTransferTransactionUseCase(
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
      fakeCreateNotificationSchedule,
    );
  });

  it('should return error if transaction does not exist', async () => {
    const result = await sut.execute({
      transactionId: 'non-existing',
      fromWalletId: 'any-wallet',
      toWalletId: 'any-wallet',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if some wallet does not exist', async () => {
    const toUser = makeUser();
    const toWallet = makeWallet({ balance: 1000, user: toUser });
    inMemoryWalletRepository.items.push(toWallet);

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 1000,
      status: TransactionStatus.PENDING,
      fromWalletId: new UniqueEntityID('from-wallet'),
      toWalletId: toWallet.id,
    });
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: 'non-existing-wallet',
      toWalletId: toWallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return error if transaction is not pending', async () => {
    const fromUser = makeUser();
    const toUser = makeUser();
    const fromWallet = makeWallet({ balance: 500, user: fromUser });
    const toWallet = makeWallet({ balance: 1000, user: toUser });

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 1000,
      status: TransactionStatus.COMPLETED,
      fromWallet: fromWallet,
      toWallet: toWallet,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
    });

    inMemoryWalletRepository.items.push(fromWallet, toWallet);
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: fromWallet.id.toString(),
      toWalletId: toWallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceInvalidError);
  });

  it('should return error if fromWallet has insufficient balance', async () => {
    const fromUser = makeUser();
    const toUser = makeUser();
    const fromWallet = makeWallet({ balance: 500, user: fromUser });
    const toWallet = makeWallet({ balance: 1000, user: toUser });

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 1000,
      status: TransactionStatus.PENDING,
      fromWallet: fromWallet,
      fromWalletId: fromWallet.id,
      toWallet: toWallet,
      toWalletId: toWallet.id,
    });

    inMemoryWalletRepository.items.push(fromWallet, toWallet);
    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      transactionId: transaction.id.toString(),
      fromWalletId: fromWallet.id.toString(),
      toWalletId: toWallet.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(InsufficienteBalanceError);
  });
});
