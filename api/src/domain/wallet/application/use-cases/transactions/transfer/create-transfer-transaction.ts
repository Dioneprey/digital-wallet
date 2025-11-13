import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { UserRepository } from '../../../repositories/user.repository';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { ResourceAlreadyExists } from '../../@errors/resource-already-exists.error';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { ProcessTransferTransactionSchedule } from '../../../schedules/process-transfer-transaction.schedule';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { WalletRepository } from '../../../repositories/wallet.repository';

interface CreateTransferTransactionUseCaseRequest {
  userId: string;
  toUserId: string;
  amount: number;
  description?: string;
}

type CreateTransferTransactionUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError,
  {
    transaction: Transaction;
  }
>;

@Injectable()
export class CreateTransferTransactionUseCase {
  constructor(
    private userRepository: UserRepository,
    private transactionRepository: TransactionRepository,
    private walletRepository: WalletRepository,
    private processTransferTransactionSchedule: ProcessTransferTransactionSchedule,
  ) {}

  async execute({
    userId,
    toUserId,
    amount,
    description,
  }: CreateTransferTransactionUseCaseRequest): Promise<CreateTransferTransactionUseCaseResponse> {
    if (userId === toUserId) {
      return left(new ResourceInvalidError('Cannot transfer to the same user'));
    }

    const [fromUserExists, toUserExists] = await Promise.all([
      this.userRepository.findByUniqueField({
        key: 'id',
        value: userId,
        include: {
          wallet: true,
        },
      }),
      this.userRepository.findByUniqueField({
        key: 'id',
        value: toUserId,
        include: {
          wallet: true,
        },
      }),
    ]);

    if (!fromUserExists || !fromUserExists.wallet) {
      return left(new ResourceNotFoundError(`User with id: ${userId}`));
    }

    if (!toUserExists || !toUserExists.wallet) {
      return left(new ResourceNotFoundError(`User with id: ${toUserId}`));
    }

    const wallet = fromUserExists.wallet;

    if (wallet.balance < amount) {
      return left(
        new InsufficienteBalanceError(`Wallet ${wallet.id.toString()}`),
      );
    }

    const transaction = Transaction.create({
      type: TransactionType.TRANSFER,
      amount,
      description: description || 'Transferência feita',
      status: TransactionStatus.PENDING,
      fromWalletId: fromUserExists.wallet.id,
      toWalletId: toUserExists.wallet.id,
    });

    wallet.balance -= amount; // Reserva o valor

    await Promise.all([
      this.walletRepository.save(wallet),
      this.transactionRepository.create(transaction),
    ]);

    await this.processTransferTransactionSchedule.enqueueJob(
      {
        transactionId: transaction.id.toString(),
        fromWalletId: fromUserExists.wallet.id.toString(),
        toWalletId: toUserExists.wallet.id.toString(),
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
