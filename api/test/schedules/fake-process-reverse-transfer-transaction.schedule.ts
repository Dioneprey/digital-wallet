import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  ProcessReverseTransferTransactionParams,
  ProcessReverseTransferTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-reverse-transfer-transaction.schedule';

interface ScheduledJob {
  data: ProcessReverseTransferTransactionParams;
  options?: ScheduleOptions;
}

export class FakeProcessReverseTransferTransactionSchedule extends ProcessReverseTransferTransactionSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: ProcessReverseTransferTransactionParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }

  async removeJobById(id: string): Promise<void> {
    this.jobs = this.jobs.filter((job) => job.options?.jobId !== id);
  }
}
