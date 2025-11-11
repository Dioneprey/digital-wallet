import { ScheduleOptions } from 'src/core/types/schedule-options';

export interface ProcessDepositTransactionParams {
  transactionId: string;
  toWalletId: string;
}

export abstract class ProcessDepositTransactionSchedule {
  abstract enqueueJob(
    data: ProcessDepositTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void>;

  abstract removeJobById(id: string): Promise<void>;
}
