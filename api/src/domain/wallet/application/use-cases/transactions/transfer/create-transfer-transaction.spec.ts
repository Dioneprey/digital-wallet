import { expect } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { CreateTransferTransactionUseCase } from './create-transfer-transaction';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { makeWallet } from 'test/factories/make-wallet';
import { makeUser } from 'test/factories/make-user';
import { FakeProcessTransferTransactionSchedule } from 'test/schedules/fake-process-transfer-transaction.schedule';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeProcessTransferTransactionSchedule: FakeProcessTransferTransactionSchedule;
let sut: CreateTransferTransactionUseCase;

describe('Create transfer transaction', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeProcessTransferTransactionSchedule =
      new FakeProcessTransferTransactionSchedule();

    sut = new CreateTransferTransactionUseCase(
      inMemoryUserRepository,
      inMemoryTransactionRepository,
      fakeProcessTransferTransactionSchedule,
    );
  });

  it('should create a transfer transaction and enqueue a job', async () => {
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

    const result = await sut.execute({
      userId: sender.id.toString(),
      toUserId: receiver.id.toString(),
      amount: 2000,
      description: 'Pagamento',
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const { transaction } = result.value;

    expect(transaction).toBeDefined();
    expect(transaction.amount).toBe(2000);
    expect(transaction.type).toBe('TRANSFER');
    expect(transaction.status).toBe('PENDING');

    expect(fakeProcessTransferTransactionSchedule.jobs).toHaveLength(1);
    expect(fakeProcessTransferTransactionSchedule.jobs[0].data).toEqual(
      expect.objectContaining({
        transactionId: transaction.id.toString(),
        fromWalletId: senderWallet.id.toString(),
        toWalletId: receiverWallet.id.toString(),
      }),
    );
  });

  it('should not allow transfer to the same user', async () => {
    const wallet = makeWallet({ balance: 10000 });
    const user = makeUser(
      { name: 'Alice', email: 'alice@example.com', password: '123' },
      new UniqueEntityID('user-1'),
    );
    user.wallet = wallet;
    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      toUserId: user.id.toString(),
      amount: 1000,
    });
    console.log(result.isLeft());

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceInvalidError);
  });
});
