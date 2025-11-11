import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { WalletRepository } from '../../../repositories/wallet.repository';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';

interface ProcessWithdrawTransactionUseCaseRequest {
  transactionId: string;
  fromWalletId: string;
}

type ProcessWithdrawTransactionUseCaseResponse = Either<
  ResourceNotFoundError | InsufficienteBalanceError | ResourceInvalidError,
  undefined
>;

@Injectable()
export class ProcessWithdrawTransactionUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute({
    fromWalletId,
    transactionId,
  }: ProcessWithdrawTransactionUseCaseRequest): Promise<ProcessWithdrawTransactionUseCaseResponse> {
    const [transactionExists, walletExists] = await Promise.all([
      this.transactionRepository.findByUniqueField({
        key: 'id',
        value: transactionId,
      }),
      this.walletRepository.findByUniqueField({
        key: 'id',
        value: fromWalletId,
      }),
    ]);

    if (!transactionExists) {
      return left(
        new ResourceNotFoundError(`Transaction with id: ${transactionId}`),
      );
    }

    if (!walletExists) {
      return left(new ResourceNotFoundError(`Wallet with id: ${fromWalletId}`));
    }

    if (transactionExists.status !== TransactionStatus.PENDING) {
      return left(
        new ResourceInvalidError(
          `Transaction ${transactionId} already processed}`,
        ),
      );
    }

    if (walletExists.balance < transactionExists.amount) {
      return left(new InsufficienteBalanceError(`Wallet ${fromWalletId}`));
    }

    transactionExists.status = TransactionStatus.COMPLETED;

    await this.transactionRepository.applyTransactionToWallet({
      transaction: transactionExists,
      wallet: walletExists,
    });

    return right(undefined);
  }
}
