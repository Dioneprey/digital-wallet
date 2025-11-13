import { expect, describe, it, beforeEach } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeUser } from 'test/factories/make-user';
import { makeWallet } from 'test/factories/make-wallet';
import { makeTransaction } from 'test/factories/make-transaction';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import {
  TransactionType,
  TransactionStatus,
} from 'src/domain/wallet/entities/transaction';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { FetchUsersByEmailUseCase } from './fetch-users-by-email';
import { _ } from 'vitest/dist/chunks/reporters.d.BFLkQcL6';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;

let sut: FetchUsersByEmailUseCase;

describe('Fetch users by email', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();

    sut = new FetchUsersByEmailUseCase(inMemoryUserRepository);
  });

  it('should return users successfully', async () => {
    const user = makeUser();
    const wallet = makeWallet({ balance: 10000, userId: user.id });

    user.wallet = wallet;

    inMemoryUserRepository.items.push(user);
    inMemoryWalletRepository.items.push(wallet);

    Array.from({ length: 5 }).map((_, index) =>
      inMemoryUserRepository.items.push(
        makeUser({
          email: `user${index}@gmail.com`,
        }),
      ),
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      email: 'user',
      pageSize: 10,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(5);
      expect(result.value.totalCount).toBe(5);
      expect(result.value.totalPages).toBe(1);
    }
  });
});
