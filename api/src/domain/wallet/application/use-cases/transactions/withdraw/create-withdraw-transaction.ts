import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { UserRepository } from '../../../repositories/user.repository';
import { ResourceAlreadyExists } from '../../@errors/resource-already-exists.error';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { ProcessWithdrawTransactionSchedule } from '../../../schedules/process-withdraw-transaction.schedule';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { WalletRepository } from '../../../repositories/wallet.repository';

interface CreateWithdrawTransactionUseCaseRequest {
  userId: string;
  amount: number;
  description?: string;
}

type CreateWithdrawTransactionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    transaction: Transaction;
  }
>;

@Injectable()
export class CreateWithdrawTransactionUseCase {
  constructor(
    private userRepository: UserRepository,
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private processWithdrawTransactionSchedule: ProcessWithdrawTransactionSchedule,
  ) {}

  async execute({
    userId,
    amount,
    description,
  }: CreateWithdrawTransactionUseCaseRequest): Promise<CreateWithdrawTransactionUseCaseResponse> {
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

    if (wallet.balance < amount) {
      return left(
        new InsufficienteBalanceError(`Wallet ${wallet.id.toString()}`),
      );
    }

    const transaction = Transaction.create({
      type: TransactionType.WITHDRAW,
      amount,
      description: description || 'Retirada em conta',
      status: TransactionStatus.PENDING,
      fromWalletId: userExists.wallet.id,
    });

    wallet.balance -= amount; // Reserva o valor

    await Promise.all([
      this.walletRepository.save(wallet),
      this.transactionRepository.create(transaction),
    ]);

    await this.processWithdrawTransactionSchedule.enqueueJob(
      {
        transactionId: transaction.id.toString(),
        fromWalletId: userExists.wallet.id.toString(),
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
