import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { WalletRepository } from '../../repositories/wallet.repository';

interface UpdateTransactionOnErrorUseCaseRequest {
  transactionId: string;
  status: TransactionStatus;
  fromWalletId?: string;
  shouldChangeAmount: boolean;
}

type UpdateTransactionOnErrorUseCaseResponse = Either<
  ResourceNotFoundError,
  undefined
>;

@Injectable()
export class UpdateTransactionOnErrorUseCase {
  constructor(
    private transactionRepository: TransactionRepository,
    private walletRepository: WalletRepository,
  ) {}

  async execute({
    status,
    transactionId,
    fromWalletId,
    shouldChangeAmount,
  }: UpdateTransactionOnErrorUseCaseRequest): Promise<UpdateTransactionOnErrorUseCaseResponse> {
    const transactionExists =
      await this.transactionRepository.findByUniqueField({
        key: 'id',
        value: transactionId,
      });

    if (!transactionExists) {
      return left(
        new ResourceNotFoundError(`Transaction with id ${transactionId}`),
      );
    }

    if (
      fromWalletId &&
      transactionExists.fromWalletId?.toString() === fromWalletId
    ) {
      const wallet = await this.walletRepository.findByUniqueField({
        key: 'id',
        value: fromWalletId,
      });

      if (wallet) {
        // Reverte saldo reservado apenas se shouldChangeAmount for true
        if (shouldChangeAmount) {
          wallet.balance += transactionExists.amount;
          await this.walletRepository.save(wallet);
        }
      }
    }
    transactionExists.status = status;

    await this.transactionRepository.save(transactionExists);

    return right(undefined);
  }
}
