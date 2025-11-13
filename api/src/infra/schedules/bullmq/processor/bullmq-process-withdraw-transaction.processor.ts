import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as Sentry from '@sentry/nestjs';
import { ProcessWithdrawTransactionParams } from 'src/domain/wallet/application/schedules/process-withdraw-transaction.schedule';
import { UpdateTransactionOnErrorUseCase } from 'src/domain/wallet/application/use-cases/transactions/handle-transaction-error';
import { TransactionStatus } from 'src/domain/wallet/entities/transaction';
import { ProcessWithdrawTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/withdraw/process-withdraw-deposit-transaction';

export const PROCESS_WITHDRAW_TRANSACTION = 'process-withdraw-transaction';

@Processor(PROCESS_WITHDRAW_TRANSACTION)
export class BullMQProcessWithdrawTransactionProcessor extends WorkerHost {
  private logger = new Logger(BullMQProcessWithdrawTransactionProcessor.name);

  constructor(
    private processWithdrawTransaction: ProcessWithdrawTransactionUseCase,
    private UpdateTransactionOnErrorUseCase: UpdateTransactionOnErrorUseCase,
  ) {
    super();
  }

  async process(job: Job<ProcessWithdrawTransactionParams>): Promise<void> {
    this.logger.debug(
      `Process job for withdraw: ${job.data.transactionId}, queued`,
    );

    try {
      await this.processWithdrawTransaction.execute({
        fromWalletId: job.data.fromWalletId,
        transactionId: job.data.transactionId,
      });
    } catch (error) {
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<ProcessWithdrawTransactionParams>, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      this.logger.warn(
        `Job failed for withdraw ${job.data.transactionId}, retrying... (${job.attemptsMade}/${maxAttempts})`,
      );
      return;
    }

    this.logger.error(
      `❌ Job permanently failed for withdraw ${job.data.transactionId}: ${error.message}`,
    );

    Sentry.captureException(error);

    await this.UpdateTransactionOnErrorUseCase.execute({
      transactionId: job.data.transactionId,
      fromWalletId: job.data.fromWalletId,
      status: TransactionStatus.FAILED,
      shouldChangeAmount: true,
    });
  }
}
