import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { WalletRepository } from '../../../repositories/wallet.repository';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';

interface ProcessTransferTransactionUseCaseRequest {
  transactionId: string;
  fromWalletId: string;
  toWalletId: string;
}

type ProcessTransferTransactionUseCaseResponse = Either<
  ResourceNotFoundError | InsufficienteBalanceError | ResourceInvalidError,
  undefined
>;

@Injectable()
export class ProcessTransferTransactionUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute({
    fromWalletId,
    toWalletId,
    transactionId,
  }: ProcessTransferTransactionUseCaseRequest): Promise<ProcessTransferTransactionUseCaseResponse> {
    const [transactionExists, fromWalletExists, toWalletExists] =
      await Promise.all([
        this.transactionRepository.findByUniqueField({
          key: 'id',
          value: transactionId,
        }),
        this.walletRepository.findByUniqueField({
          key: 'id',
          value: fromWalletId,
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

    if (!fromWalletExists) {
      return left(new ResourceNotFoundError(`Wallet with id: ${fromWalletId}`));
    }

    if (!toWalletExists) {
      return left(new ResourceNotFoundError(`Wallet with id: ${toWalletId}`));
    }

    if (transactionExists.status !== TransactionStatus.PENDING) {
      return left(
        new ResourceInvalidError(
          `Transaction ${transactionId} already processed`,
        ),
      );
    }

    if (fromWalletExists.balance < transactionExists.amount) {
      return left(new InsufficienteBalanceError(`Wallet ${fromWalletExists}`));
    }

    transactionExists.status = TransactionStatus.COMPLETED;

    toWalletExists.balance = toWalletExists.balance + transactionExists.amount;

    await this.transactionRepository.applyTransferBetweenWallets({
      transaction: transactionExists,
      fromWallet: fromWalletExists,
      toWallet: toWalletExists,
    });

    return right(undefined);
  }
}
