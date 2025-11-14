import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  CreateNotificationParams,
  CreateNotificationSchedule,
} from 'src/domain/wallet/application/schedules/create-notification';

interface ScheduledJob {
  data: CreateNotificationParams;
  options?: ScheduleOptions;
}

export class FakeCreateNotificationSchedule extends CreateNotificationSchedule {
  public jobs: ScheduledJob[] = [];

  async enqueueJob(
    data: CreateNotificationParams,
    options?: ScheduleOptions,
  ): Promise<void> {
    this.jobs.push({ data, options });
  }

  async removeJobById(id: string): Promise<void> {
    this.jobs = this.jobs.filter((job) => job.options?.jobId !== id);
  }
}
