import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  ProcessWithdrawTransactionParams,
  ProcessWithdrawTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-withdraw-transaction.schedule';

interface ScheduledJob {
  data: ProcessWithdrawTransactionParams;
  options?: ScheduleOptions;
}

export class FakeProcessWithdrawTransactionSchedule extends ProcessWithdrawTransactionSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: ProcessWithdrawTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }

  async removeJobById(id: string): Promise<void> {
    this.jobs = this.jobs.filter((job) => job.options?.jobId !== id);
  }
}
