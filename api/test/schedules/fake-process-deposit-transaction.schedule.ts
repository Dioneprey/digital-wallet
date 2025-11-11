import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  ProcessDepositTransactionParams,
  ProcessDepositTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-deposit-transaction.schedule';

interface ScheduledJob {
  data: ProcessDepositTransactionParams;
  options?: ScheduleOptions;
}

export class FakeProcessDepositTransactionSchedule extends ProcessDepositTransactionSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: ProcessDepositTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }

  async removeJobById(id: string): Promise<void> {
    this.jobs = this.jobs.filter((job) => job.options?.jobId !== id);
  }
}
