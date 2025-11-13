import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { WalletRepository } from '../../../repositories/wallet.repository';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import {
  ReversalInitiator,
  TransactionStatus,
} from 'src/domain/wallet/entities/transaction';

interface ProcessReverseTransferTransactionUseCaseRequest {
  transactionId: string;
  fromWalletId: string;
  toWalletId: string;
  reason?: string;
}

type ProcessReverseTransferTransactionUseCaseResponse = Either<
  ResourceNotFoundError | InsufficienteBalanceError | ResourceInvalidError,
  undefined
>;

@Injectable()
export class ProcessReverseTransferTransactionUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute({
    fromWalletId,
    toWalletId,
    transactionId,
    reason,
  }: ProcessReverseTransferTransactionUseCaseRequest): Promise<ProcessReverseTransferTransactionUseCaseResponse> {
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

    transactionExists.status = TransactionStatus.REVERSED;
    transactionExists.reversalInitiator = ReversalInitiator.USER;
    transactionExists.reversalReason = reason || 'Devolução de transferência';

    fromWalletExists.balance += transactionExists.amount;
    toWalletExists.balance -= transactionExists.amount;
    // Sem verificação de valor atual da carteira
    // Caso não possua mais valor, ficará um valor negativo, como se estivesse em débito

    await this.transactionRepository.applyTransferBetweenWallets({
      transaction: transactionExists,
      fromWallet: fromWalletExists,
      toWallet: toWalletExists,
    });

    return right(undefined);
  }
}
