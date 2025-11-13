import { ScheduleOptions } from 'src/core/types/schedule-options';

export interface ProcessReverseTransferTransactionParams {
  transactionId: string;
  fromWalletId: string;
  toWalletId: string;
  reason?: string;
}

export abstract class ProcessReverseTransferTransactionSchedule {
  abstract enqueueJob(
    data: ProcessReverseTransferTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void>;

  abstract removeJobById(id: string): Promise<void>;
}
