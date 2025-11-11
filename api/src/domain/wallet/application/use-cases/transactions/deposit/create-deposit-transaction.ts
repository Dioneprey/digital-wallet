import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { UserRepository } from '../../../repositories/user.repository';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { ProcessDepositTransactionSchedule } from '../../../schedules/process-deposit-transaction.schedule';
import { TransactionRepository } from '../../../repositories/transaction.repository';

interface CreateDepositTransactionUseCaseRequest {
  userId: string;
  amount: number;
  description?: string;
}

type CreateDepositTransactionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    transaction: Transaction;
  }
>;

@Injectable()
export class CreateDepositTransactionUseCase {
  constructor(
    private userRepository: UserRepository,
    private transactionRepository: TransactionRepository,
    private processDepositTransactionSchedule: ProcessDepositTransactionSchedule,
  ) {}

  async execute({
    userId,
    amount,
    description,
  }: CreateDepositTransactionUseCaseRequest): Promise<CreateDepositTransactionUseCaseResponse> {
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

    const transaction = Transaction.create({
      type: TransactionType.DEPOSIT,
      amount,
      description: description ?? 'Depósito em conta',
      status: TransactionStatus.PENDING,
      toWalletId: userExists.wallet.id,
    });

    await this.transactionRepository.create(transaction);

    await this.processDepositTransactionSchedule.enqueueJob(
      {
        transactionId: transaction.id.toString(),
        toWalletId: userExists.wallet.id.toString(),
      },
      {
        jobId: transaction.id.toString(),
        removeOnComplete: false,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    return right({ transaction });
  }
}
