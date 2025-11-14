import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../../@errors/resource-not-found.error';
import { WalletRepository } from '../../../repositories/wallet.repository';
import { TransactionRepository } from '../../../repositories/transaction.repository';
import { InsufficienteBalanceError } from '../../@errors/insufficiente-balance.error';
import { ResourceInvalidError } from '../../@errors/resource-invalid.error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';
import { CreateNotificationSchedule } from '../../../schedules/create-notification';
import { NotificationGateway } from 'src/infra/events/gateways/socket/notification.gateway';

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
    private createNotificationSchedule: CreateNotificationSchedule,
    private notificationGateway?: NotificationGateway,
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
          include: {
            user: true,
          },
        }),
        this.walletRepository.findByUniqueField({
          key: 'id',
          value: toWalletId,
          include: {
            user: true,
          },
        }),
      ]);

    if (!transactionExists) {
      return left(
        new ResourceNotFoundError(`Transaction with id: ${transactionId}`),
      );
    }

    if (!fromWalletExists || !fromWalletExists.user) {
      return left(new ResourceNotFoundError(`Wallet with id: ${fromWalletId}`));
    }

    if (!toWalletExists || !toWalletExists.user) {
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

    await Promise.all([
      this.createNotificationSchedule.enqueueJob({
        userId: fromWalletExists.userId.toString(),
        title: 'Transferência enviada',
        variables: {
          amount: transactionExists.amount,
          userName: toWalletExists.user.name,
        },
      }),
      this.createNotificationSchedule.enqueueJob({
        userId: toWalletExists.userId.toString(),
        title: 'Transferência recebida',
        variables: {
          amount: transactionExists.amount,
          userName: fromWalletExists.user.name,
        },
      }),
    ]);

    if (this.notificationGateway) {
      this.notificationGateway.newTransaction({
        userId: fromWalletExists.user.id.toString(),
      });
      this.notificationGateway.newTransaction({
        userId: toWalletExists.user.id.toString(),
      });
    }

    return right(undefined);
  }
}
