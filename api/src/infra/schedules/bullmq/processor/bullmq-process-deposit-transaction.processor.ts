import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as Sentry from '@sentry/nestjs';
import { ProcessDepositTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/deposit/process-deposit-transaction';
import { ProcessDepositTransactionParams } from 'src/domain/wallet/application/schedules/process-deposit-transaction.schedule';
import { UpdateTransactionOnErrorUseCase } from 'src/domain/wallet/application/use-cases/transactions/handle-transaction-error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';

export const PROCESS_DEPOSIT_TRANSACTION = 'process-deposit-transaction';

@Processor(PROCESS_DEPOSIT_TRANSACTION)
export class BullMQProcessDepositTransactionProcessor extends WorkerHost {
  private logger = new Logger(BullMQProcessDepositTransactionProcessor.name);

  constructor(
    private processDepositTransaction: ProcessDepositTransactionUseCase,
    private updateTransactionOnErrorUseCase: UpdateTransactionOnErrorUseCase,
  ) {
    super();
  }

  async process(job: Job<ProcessDepositTransactionParams>): Promise<void> {
    this.logger.debug(
      `Process job for deposit: ${job.data.transactionId}, queued`,
    );

    try {
      await this.processDepositTransaction.execute({
        toWalletId: job.data.toWalletId,
        transactionId: job.data.transactionId,
      });
    } catch (error) {
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessDepositTransactionParams>, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      this.logger.warn(
        `Job failed for deposit ${job.data.transactionId}, retrying... (${job.attemptsMade}/${maxAttempts})`,
      );
      return;
    }

    this.logger.error(
      `❌ Job permanently failed for deposit ${job.data.transactionId}: ${error.message}`,
    );

    Sentry.captureException(error);

    await this.updateTransactionOnErrorUseCase.execute({
      transactionId: job.data.transactionId,
      status: TransactionStatus.FAILED,
    });
  }
}
