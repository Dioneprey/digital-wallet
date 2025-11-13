import { expect } from 'vitest';
import { GetWalletBalanceUseCase } from './get-wallet-balance';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';
import { makeUser } from 'test/factories/make-user';
import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { makeWallet } from 'test/factories/make-wallet';

let inMemoryWalletRepository: InMemoryWalletRepository;
let inMemoryUserRepository: InMemoryUserRepository;

let sut: GetWalletBalanceUseCase;

describe('Get wallet balance', () => {
  beforeEach(() => {
    inMemoryWalletRepository = new InMemoryWalletRepository();
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new GetWalletBalanceUseCase(inMemoryWalletRepository);
  });

  it('should be able to get wallet balance from user', async () => {
    const user = makeUser({});
    const wallet = makeWallet({
      userId: user.id,
      balance: 100,
    });

    inMemoryUserRepository.create(user);
    inMemoryWalletRepository.create(wallet);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    if (result.isLeft()) {
      throw new Error('Failed');
    }

    expect(result.value.wallet.balance).toEqual(100);
  });
});
