import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from 'src/domain/wallet/entities/user';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

interface MeUseCaseRequest {
  userId: string;
}

type MeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: User;
  }
>;

@Injectable()
export class MeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: MeUseCaseRequest): Promise<MeUseCaseResponse> {
    const userExists = await this.userRepository.findByUniqueField({
      key: 'id',
      value: userId,
    });

    if (!userExists) {
      return left(new ResourceNotFoundError(`User with id: ${userId}`));
    }

    return right({ user: userExists });
  }
}
