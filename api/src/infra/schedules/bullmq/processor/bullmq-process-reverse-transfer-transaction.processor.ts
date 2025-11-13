import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as Sentry from '@sentry/nestjs';
import { UpdateTransactionOnErrorUseCase } from 'src/domain/wallet/application/use-cases/transactions/handle-transaction-error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';
import { ProcessReverseTransferTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/transfer/process-reverse-transfer-transaction';
import { ProcessReverseTransferTransactionParams } from 'src/domain/wallet/application/schedules/process-reverse-transfer-transaction.schedule';

export const PROCESS_REVERSE_TRANSFER_TRANSACTION =
  'process-reverse-transfer-transaction';

@Processor(PROCESS_REVERSE_TRANSFER_TRANSACTION)
export class BullMQProcessReverseTransactionProcessor extends WorkerHost {
  private logger = new Logger(BullMQProcessReverseTransactionProcessor.name);

  constructor(
    private processReverseTransaction: ProcessReverseTransferTransactionUseCase,
    private updateTransactionOnErrorUseCase: UpdateTransactionOnErrorUseCase,
  ) {
    super();
  }

  async process(
    job: Job<ProcessReverseTransferTransactionParams>,
  ): Promise<void> {
    this.logger.debug(
      `Process job to reverse transfer: ${job.data.transactionId}, queued`,
    );

    try {
      await this.processReverseTransaction.execute({
        toWalletId: job.data.toWalletId,
        fromWalletId: job.data.fromWalletId,
        transactionId: job.data.transactionId,
        reason: job.data.reason,
      });
    } catch (error) {
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<ProcessReverseTransferTransactionParams>,
    error: Error,
  ) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      this.logger.warn(
        `Job failed for transfer ${job.data.transactionId}, retrying... (${job.attemptsMade}/${maxAttempts})`,
      );
      return;
    }

    this.logger.error(
      `❌ Job permanently failed for transfer ${job.data.transactionId}: ${error.message}`,
    );

    Sentry.captureException(error);

    // Volta transferencia pra como estava antes
    await this.updateTransactionOnErrorUseCase.execute({
      transactionId: job.data.transactionId,
      fromWalletId: job.data.fromWalletId,
      status: TransactionStatus.COMPLETED,
      shouldChangeAmount: false,
    });
  }
}
