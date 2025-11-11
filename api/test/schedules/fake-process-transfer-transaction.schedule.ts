import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  ProcessTransferTransactionParams,
  ProcessTransferTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-transfer-transaction.schedule';

interface ScheduledJob {
  data: ProcessTransferTransactionParams;
  options?: ScheduleOptions;
}

export class FakeProcessTransferTransactionSchedule extends ProcessTransferTransactionSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: ProcessTransferTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }

  async removeJobById(id: string): Promise<void> {
    this.jobs = this.jobs.filter((job) => job.options?.jobId !== id);
  }
}
