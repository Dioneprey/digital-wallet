import { ScheduleOptions } from 'src/core/types/schedule-options';

export interface ProcessWithdrawTransactionParams {
  transactionId: string;
  fromWalletId: string;
}

export abstract class ProcessWithdrawTransactionSchedule {
  abstract enqueueJob(
    data: ProcessWithdrawTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void>;

  abstract removeJobById(id: string): Promise<void>;
}
