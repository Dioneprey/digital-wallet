import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as Sentry from '@sentry/nestjs';
import { ProcessTransferTransactionParams } from 'src/domain/wallet/application/schedules/process-transfer-transaction.schedule';
import { UpdateTransactionOnErrorUseCase } from 'src/domain/wallet/application/use-cases/transactions/handle-transaction-error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';
import { ProcessTransferTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/transfer/process-transfer-deposit-transaction';

export const PROCESS_TRANSFER_TRANSACTION = 'process-transfer-transaction';

@Processor(PROCESS_TRANSFER_TRANSACTION)
export class BullMQProcessTransferTransactionProcessor extends WorkerHost {
  private logger = new Logger(BullMQProcessTransferTransactionProcessor.name);

  constructor(
    private processTransferTransaction: ProcessTransferTransactionUseCase,
    private updateTransactionOnErrorUseCase: UpdateTransactionOnErrorUseCase,
  ) {
    super();
  }

  async process(job: Job<ProcessTransferTransactionParams>): Promise<void> {
    this.logger.debug(
      `Process job for transfer: ${job.data.transactionId}, queued`,
    );

    try {
      await this.processTransferTransaction.execute({
        toWalletId: job.data.toWalletId,
        fromWalletId: job.data.fromWalletId,
        transactionId: job.data.transactionId,
      });
    } catch (error) {
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessTransferTransactionParams>, error: Error) {
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

    await this.updateTransactionOnErrorUseCase.execute({
      transactionId: job.data.transactionId,
      fromWalletId: job.data.fromWalletId,
      status: TransactionStatus.FAILED,
    });
  }
}
