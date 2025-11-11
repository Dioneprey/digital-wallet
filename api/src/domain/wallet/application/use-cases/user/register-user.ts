import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { UserRepository } from '../../repositories/user.repository';
import { ResourceAlreadyExists } from '../@errors/resource-already-exists.error';
import { HashGenerator } from '../../cryptography/hash-generator';
import { CodeRepository } from '../../repositories/code.repository';
import { User } from 'src/domain/wallet/entities/user';
import { Code, CodeType } from 'src/domain/wallet/entities/code';
import { UserPayload } from 'src/core/types/user-payload';
import { Wallet } from 'src/domain/wallet/entities/wallet';
import { WalletRepository } from '../../repositories/wallet.repository';

interface RegisterUserUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterUserUseCaseResponse = Either<
  ResourceAlreadyExists,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository,
    private walletRepository: WalletRepository,
    private encrypter: Encrypter,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    email,
    password,
    name,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const userWithSameEmailExists = await this.userRepository.findByUniqueField(
      {
        key: 'email',
        value: email,
      },
    );

    if (userWithSameEmailExists) {
      return left(new ResourceAlreadyExists(`User with email: ${email}`));
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = User.create({
      email,
      name,
      password: hashedPassword,
    });

    await this.userRepository.create(user);

    const accessTokenPayload: UserPayload = {
      sub: user.id.toString(),
    };

    const accessToken = await this.encrypter.encrypt(accessTokenPayload);

    const refreshToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const code = Code.create({
      userId: user.id,
      value: refreshToken,
      type: CodeType.REFRESH_TOKEN,
      expiresAt: expiresAt,
    });

    const wallet = Wallet.create({
      balance: 0,
      userId: user.id,
    });

    await Promise.all([
      this.walletRepository.create(wallet),

      this.codeRepository.create(code),
    ]);

    return right({ accessToken, refreshToken });
  }
}
