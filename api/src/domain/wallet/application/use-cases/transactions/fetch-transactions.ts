import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'src/core/either';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { UserRepository } from '../../repositories/user.repository';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';

export interface FetchTransactionsUseCaseRequest {
  userId: string;
  pageIndex: number;
  pageSize: number;
  type?: TransactionType;
  status?: TransactionStatus;
}

type FetchTransactionsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    totalCount: number;
    totalPages: number;
    transactions: Transaction[];
  }
>;

@Injectable()
export class FetchTransactionsUseCase {
  constructor(
    private transactionRepository: TransactionRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    userId,
    pageIndex,
    pageSize,
    type,
    status,
  }: FetchTransactionsUseCaseRequest): Promise<FetchTransactionsUseCaseResponse> {
    const userExists = await this.userRepository.findByUniqueField({
      key: 'id',
      value: userId,
      include: {
        wallet: true,
      },
    });

    if (!userExists || !userExists.wallet) {
      return left(new ResourceNotFoundError(`User with id: ${userId}`));
    }

    const wallet = userExists.wallet;

    const {
      data: transactions,
      totalCount,
      totalPages,
    } = await this.transactionRepository.findMany({
      pageIndex,
      pageSize,
      filters: {
        type,
        walletId: wallet.id.toString(),
        status,
      },
    });

    return right({
      transactions,
      totalCount,
      totalPages,
    });
  }
}
