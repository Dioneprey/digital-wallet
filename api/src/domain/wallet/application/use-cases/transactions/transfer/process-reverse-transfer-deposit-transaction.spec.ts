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
import { ProcessReverseTransferTransactionUseCase } from './process-reverse-transfer-transaction';
import { FakeCreateNotificationSchedule } from 'test/schedules/fake-create-notification-schedule';
import { makeUser } from 'test/factories/make-user';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeCreateNotificationSchedule: FakeCreateNotificationSchedule;

let sut: ProcessReverseTransferTransactionUseCase;

describe('Process reverse transfer transaction', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeCreateNotificationSchedule = new FakeCreateNotificationSchedule();
    sut = new ProcessReverseTransferTransactionUseCase(
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
      fakeCreateNotificationSchedule,
    );
  });

  it('should process a reverse transfer transaction successfully', async () => {
    const fromUser = makeUser();
    const toUser = makeUser();
    const fromWallet = makeWallet(
      { balance: 10000, user: fromUser },
      new UniqueEntityID(),
    );
    const toWallet = makeWallet(
      { balance: 5000, user: toUser },
      new UniqueEntityID(),
    );

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 5000,
      status: TransactionStatus.PENDING,
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
    console.log({ result });

    expect(inMemoryTransactionRepository.items[0].status).toBe(
      TransactionStatus.REVERSED,
    );
  });
});
