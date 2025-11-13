import { Either, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from 'src/domain/wallet/entities/user';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

interface FetchUsersByEmailUseCaseRequest {
  userId: string;
  email: string;
  pageSize: number;
}

type FetchUsersByEmailUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    totalCount: number;
    totalPages: number;
    users: User[];
  }
>;

@Injectable()
export class FetchUsersByEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    email,
    pageSize,
    userId,
  }: FetchUsersByEmailUseCaseRequest): Promise<FetchUsersByEmailUseCaseResponse> {
    const {
      data: users,
      totalCount,
      totalPages,
    } = await this.userRepository.findMany({
      pageSize,
      pageIndex: 1,
      filters: {
        email,
        not: userId,
      },
    });

    return right({
      users,
      totalCount,
      totalPages,
    });
  }
}
