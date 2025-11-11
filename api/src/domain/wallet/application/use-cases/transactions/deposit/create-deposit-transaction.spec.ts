import { expect } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { CreateDepositTransactionUseCase } from './create-deposit-transaction';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { makeWallet } from 'test/factories/make-wallet';
import { makeUser } from 'test/factories/make-user';
import { FakeProcessDepositTransactionSchedule } from 'test/schedules/fake-process-deposit-transaction.schedule';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;
let fakeProcessDepositTransactionSchedule: FakeProcessDepositTransactionSchedule;
let sut: CreateDepositTransactionUseCase;

describe('Create deposit transaction', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();
    fakeProcessDepositTransactionSchedule =
      new FakeProcessDepositTransactionSchedule();

    sut = new CreateDepositTransactionUseCase(
      inMemoryUserRepository,
      inMemoryTransactionRepository,
      fakeProcessDepositTransactionSchedule,
    );
  });

  it('should be able to create a deposit transaction and enqueue a job', async () => {
    const wallet = makeWallet({ balance: 0 });
    const user = makeUser(
      {
        name: 'Ana',
        email: 'ana@example.com',
        password: '123456',
      },
      new UniqueEntityID('user-1'),
    );
    user.wallet = wallet;
    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      amount: 5000,
      description: 'Depósito inicial',
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const { transaction } = result.value;

    expect(transaction).toBeDefined();
    expect(transaction.amount).toBe(5000);
    expect(transaction.type).toBe('DEPOSIT');
    expect(transaction.status).toBe('PENDING');

    expect(fakeProcessDepositTransactionSchedule.jobs).toHaveLength(1);
    expect(fakeProcessDepositTransactionSchedule.jobs[0].data).toEqual(
      expect.objectContaining({
        transactionId: transaction.id.toString(),
        toWalletId: wallet.id.toString(),
      }),
    );
  });
});
