import { expect, describe, it, beforeEach } from 'vitest';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeUser } from 'test/factories/make-user';
import { makeWallet } from 'test/factories/make-wallet';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { FetchUsersByEmailUseCase } from './fetch-users-by-email';
import { MeUseCase } from './me';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;

let sut: MeUseCase;

describe('Get me', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();

    sut = new MeUseCase(inMemoryUserRepository);
  });

  it('should return user profile', async () => {
    const user = makeUser();
    const wallet = makeWallet({ balance: 10000, userId: user.id });

    user.wallet = wallet;

    inMemoryUserRepository.items.push(user);
    inMemoryWalletRepository.items.push(wallet);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.user.id).toBe(user.id);
    }
  });
});
