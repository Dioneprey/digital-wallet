import { expect } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryTransactionRepository } from 'test/repositories/in-memory-transaction.repository';
import { CreateWithdrawTransactionUseCase } from './create-withdraw-transaction';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { makeWallet } from 'test/factories/make-wallet';
import { makeUser } from 'test/factories/make-user';
import { FakeProcessWithdrawTransactionSchedule } from 'test/schedules/fake-process-withdraw-transaction.schedule';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryTransactionRepository: InMemoryTransactionRepository;
let fakeProcessWithdrawTransactionSchedule: FakeProcessWithdrawTransactionSchedule;
let sut: CreateWithdrawTransactionUseCase;

describe('Create withdraw transaction', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();
    fakeProcessWithdrawTransactionSchedule =
      new FakeProcessWithdrawTransactionSchedule();

    sut = new CreateWithdrawTransactionUseCase(
      inMemoryUserRepository,
      inMemoryWalletRepository,
      inMemoryTransactionRepository,
      fakeProcessWithdrawTransactionSchedule,
    );
  });

  it('should be able to create a withdraw transaction and enqueue a job', async () => {
    const wallet = makeWallet({ balance: 10000 });
    const user = makeUser(
      { name: 'Ana', email: 'ana@example.com', password: '123456' },
      new UniqueEntityID('user-1'),
    );
    user.wallet = wallet;
    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      amount: 5000,
      description: 'Retirada inicial',
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    const { transaction } = result.value;

    expect(transaction).toBeDefined();
    expect(transaction.amount).toBe(5000);
    expect(transaction.type).toBe('WITHDRAW');
    expect(transaction.status).toBe(TransactionStatus.PENDING);

    expect(fakeProcessWithdrawTransactionSchedule.jobs).toHaveLength(1);
    expect(fakeProcessWithdrawTransactionSchedule.jobs[0].data).toEqual(
      expect.objectContaining({
        transactionId: transaction.id.toString(),
        fromWalletId: wallet.id.toString(),
      }),
    );
  });

  it('should return error if user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existing-user',
      amount: 1000,
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
