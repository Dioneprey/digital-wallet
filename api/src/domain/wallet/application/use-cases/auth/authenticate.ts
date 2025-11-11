import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { Encrypter } from '../../cryptography/encrypter';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

import { UserPayload } from 'src/core/types/user-payload';
import { UserRepository } from '../../repositories/user.repository';
import { CodeRepository } from '../../repositories/code.repository';
import { WrongCredentialsError } from '../@errors/wrong-credentials';
import { HashComparer } from '../../cryptography/hash-comparer';
import { Code, CodeType } from 'src/domain/wallet/entities/code';

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

type AuthenticateUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository,
    private encrypter: Encrypter,
    private hashComparer: HashComparer,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const userExists = await this.userRepository.findByUniqueField({
      key: 'email',
      value: email,
    });

    if (!userExists) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      userExists.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const accessTokenPayload: UserPayload = {
      sub: userExists.id.toString(),
    };

    const accessToken = await this.encrypter.encrypt(accessTokenPayload);

    const refreshToken = await this.encrypter.encrypt({
      sub: userExists.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.codeRepository.deleteByUserId({
      userId: userExists.id.toString(),
      type: CodeType.REFRESH_TOKEN,
    });

    const code = Code.create({
      userId: userExists.id,
      value: refreshToken,
      type: CodeType.REFRESH_TOKEN,
      expiresAt: expiresAt,
    });

    await this.codeRepository.create(code);

    return right({ accessToken, refreshToken });
  }
}
