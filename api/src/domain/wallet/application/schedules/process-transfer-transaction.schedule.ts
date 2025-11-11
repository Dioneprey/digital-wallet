import { ScheduleOptions } from 'src/core/types/schedule-options';

export interface ProcessTransferTransactionParams {
  transactionId: string;
  fromWalletId: string;
  toWalletId: string;
}

export abstract class ProcessTransferTransactionSchedule {
  abstract enqueueJob(
    data: ProcessTransferTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void>;

  abstract removeJobById(id: string): Promise<void>;
}
