import { InMemoryUserRepository } from 'test/repositories/in-memory-user.repository';
import { InMemoryCodeRepository } from 'test/repositories/in-memory-code.repository';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { RegisterUserUseCase } from './register-user';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { makeUser } from 'test/factories/make-user';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';
import { InMemoryWalletRepository } from 'test/repositories/in-memory-wallet.repository';

let inMemoryUserRepository: InMemoryUserRepository;
let inMemoryCodeRepository: InMemoryCodeRepository;
let inMemoryWalletRepository: InMemoryWalletRepository;
let fakeEncrypter: FakeEncrypter;
let fakeHasher: FakeHasher;

let sut: RegisterUserUseCase;

describe('Register user', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryCodeRepository = new InMemoryCodeRepository();
    inMemoryWalletRepository = new InMemoryWalletRepository();
    fakeEncrypter = new FakeEncrypter();
    fakeHasher = new FakeHasher();

    sut = new RegisterUserUseCase(
      inMemoryUserRepository,
      inMemoryCodeRepository,
      inMemoryWalletRepository,
      fakeEncrypter,
      fakeHasher,
    );
  });

  it('should be able to register user with invitation valid', async () => {
    const result = await sut.execute({
      email: 'user@email.com',
      password: '123456',
      name: 'User',
    });

    if (result.isLeft()) {
      throw new Error(`Use case failed: ${JSON.stringify(result.value)}`);
    }

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('should not be able to register with email already used', async () => {
    const email = 'already-used@email.com';
    const user = makeUser({
      email: email,
      password: await fakeHasher.hash('123456'),
    });

    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      email: email,
      password: '123456',
      name: 'User',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceAlreadyExists);
  });
});
