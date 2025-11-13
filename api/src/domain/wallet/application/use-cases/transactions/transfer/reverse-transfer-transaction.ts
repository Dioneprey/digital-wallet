import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { UserRepository } from '../../../repositories/user.repository';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { ProcessReverseTransferTransactionSchedule } from '../../../schedules/process-reverse-transfer-transaction.schedule';

interface ReverseTransferTransactionUseCaseRequest {
  userId: string;
  transactionId: string;
  reason?: string;
}

type ReverseTransferTransactionUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError,
  {
    transaction: Transaction;
  }
>;

@Injectable()
export class ReverseTransferTransactionUseCase {
  constructor(
    private userRepository: UserRepository,
    private transactionRepository: TransactionRepository,
    private processReverseTransferTransactionSchedule: ProcessReverseTransferTransactionSchedule,
  ) {}

  async execute({
    userId,
    transactionId,
    reason,
  }: ReverseTransferTransactionUseCaseRequest): Promise<ReverseTransferTransactionUseCaseResponse> {
    const [userExists, transactionExists] = await Promise.all([
      this.userRepository.findByUniqueField({
        key: 'id',
        value: userId,
        include: {
          wallet: true,
        },
      }),
      this.transactionRepository.findByUniqueField({
        key: 'id',
        value: transactionId,
      }),
    ]);

    if (!userExists || !userExists.wallet) {
      return left(new ResourceNotFoundError(`User with id: ${userId}`));
    }

    if (!transactionExists || !transactionExists.toWalletId) {
      return left(
        new ResourceNotFoundError(`Transaction with id: ${transactionId}`),
      );
    }

    if (transactionExists.type !== TransactionType.TRANSFER) {
      return left(
        new ResourceInvalidError(
          `Transaction with id: ${transactionId} is not a transfer transaction`,
        ),
      );
    }

    if (transactionExists.status !== TransactionStatus.COMPLETED) {
      return left(
        new ResourceInvalidError(
          `Transaction ${transactionId} is not completed`,
        ),
      );
    }

    await this.processReverseTransferTransactionSchedule.enqueueJob(
      {
        transactionId: transactionExists.id.toString(),
        fromWalletId: userExists.wallet.id.toString(),
        toWalletId: transactionExists.toWalletId.toString(),
        reason,
      },
      {
        jobId: `reverse-transactionExists.id.toString()`,
        removeOnComplete: false,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    return right({ transaction: transactionExists });
  }
}
