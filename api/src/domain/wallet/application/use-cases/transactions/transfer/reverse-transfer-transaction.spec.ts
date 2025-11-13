import { expect } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { makeWallet } from 'test/factories/make-wallet';
import { makeUser } from 'test/factories/make-user';
import { ReverseTransferTransactionUseCase } from './reverse-transfer-transaction';
import { FakeProcessReverseTransferTransactionSchedule } from 'test/schedules/fake-process-reverse-transfer-transaction.schedule';
import { makeTransaction } from 'test/factories/make-transaction';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeProcessReverseTransferTransactionSchedule: FakeProcessReverseTransferTransactionSchedule;
let sut: ReverseTransferTransactionUseCase;

describe('Reverse transfer transaction', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeProcessReverseTransferTransactionSchedule =
      new FakeProcessReverseTransferTransactionSchedule();

    sut = new ReverseTransferTransactionUseCase(
      inMemoryUserRepository,
      inMemoryTransactionRepository,
      fakeProcessReverseTransferTransactionSchedule,
    );
  });

  it('should and enqueue a job to reverse a transfer transaction', async () => {
    const senderWallet = makeWallet({ balance: 10000 });
    const receiverWallet = makeWallet({ balance: 5000 });

    const sender = makeUser(
      { name: 'Alice', email: 'alice@example.com', password: '123' },
      new UniqueEntityID('user-1'),
    );
    sender.wallet = senderWallet;

    const receiver = makeUser(
      { name: 'Bob', email: 'bob@example.com', password: '456' },
      new UniqueEntityID('user-2'),
    );
    receiver.wallet = receiverWallet;

    inMemoryUserRepository.items.push(sender, receiver);

    const transaction = makeTransaction({
      type: TransactionType.TRANSFER,
      amount: 3000,
      status: TransactionStatus.COMPLETED,
      fromWallet: senderWallet,
      fromWalletId: senderWallet.id,
      toWallet: receiverWallet,
      toWalletId: receiverWallet.id,
    });

    inMemoryTransactionRepository.items.push(transaction);

    const result = await sut.execute({
      userId: sender.id.toString(),
      transactionId: transaction.id.toString(),
      reason: 'Devolve meu dinheiro',
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    expect(fakeProcessReverseTransferTransactionSchedule.jobs).toHaveLength(1);
    expect(fakeProcessReverseTransferTransactionSchedule.jobs[0].data).toEqual(
      expect.objectContaining({
        transactionId: transaction.id.toString(),
        fromWalletId: senderWallet.id.toString(),
        toWalletId: receiverWallet.id.toString(),
      }),
    );
  });
});
