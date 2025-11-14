import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import {
  CreateNotificationParams,
  CreateNotificationSchedule,
} from 'src/domain/wallet/application/schedules/create-notification';
import { CREATE_NOTIFICATION_SCHEDULE_PROCESSOR } from '../processor/create-notification-schedule.processor';

@Injectable()
export class BullMQCreateNotificationScheduleService
  implements CreateNotificationSchedule
{
  constructor(
    @InjectQueue(CREATE_NOTIFICATION_SCHEDULE_PROCESSOR)
    private readonly createNotification: Queue<CreateNotificationParams>,
  ) {}

  async enqueueJob(data: CreateNotificationParams, options?: JobsOptions) {
    await this.createNotification.add(
      CREATE_NOTIFICATION_SCHEDULE_PROCESSOR,
      data,
      options,
    );
  }
}
