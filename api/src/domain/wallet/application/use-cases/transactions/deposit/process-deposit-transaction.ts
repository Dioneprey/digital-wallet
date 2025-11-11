import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { WalletRepository } from '../../../repositories/wallet.repository';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';

interface ProcessDepositTransactionUseCaseRequest {
  transactionId: string;
  toWalletId: string;
}

type ProcessDepositTransactionUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError,
  undefined
>;

@Injectable()
export class ProcessDepositTransactionUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute({
    transactionId,
    toWalletId,
  }: ProcessDepositTransactionUseCaseRequest): Promise<ProcessDepositTransactionUseCaseResponse> {
    const [transactionExists, walletExists] = await Promise.all([
      this.transactionRepository.findByUniqueField({
        key: 'id',
        value: transactionId,
      }),
      this.walletRepository.findByUniqueField({
        key: 'id',
        value: toWalletId,
      }),
    ]);

    if (!transactionExists) {
      return left(
        new ResourceNotFoundError(`Transaction with id: ${transactionId}`),
      );
    }

    if (!walletExists) {
      return left(new ResourceNotFoundError(`Wallet with id: ${toWalletId}`));
    }

    if (transactionExists.status !== TransactionStatus.PENDING) {
      return left(
        new ResourceInvalidError(
          `Transaction ${transactionId} already processed}`,
        ),
      );
    }

    transactionExists.status = TransactionStatus.COMPLETED;
    walletExists.balance = walletExists.balance + transactionExists.amount;

    await this.transactionRepository.applyTransactionToWallet({
      transaction: transactionExists,
      wallet: walletExists,
    });

    return right(undefined);
  }
}
