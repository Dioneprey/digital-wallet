import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

import { ScheduleOptions } from 'src/core/types/schedule-options';
import {
  ProcessDepositTransactionParams,
  ProcessDepositTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-deposit-transaction.schedule';
import { PROCESS_DEPOSIT_TRANSACTION } from '../processor/bullmq-process-deposit-transaction.processor';

@Injectable()
export class BullMQProcessDepositTransactionScheduleScheduleService
  implements ProcessDepositTransactionSchedule
{
  constructor(
    @InjectQueue(PROCESS_DEPOSIT_TRANSACTION)
    private readonly processDepositTransactionSchedule: Queue<ProcessDepositTransactionParams>,
  ) {}

  async enqueueJob(
    data: ProcessDepositTransactionParams,
    options?: ScheduleOptions,
  ) {
    const bullmqOptions: JobsOptions = {
      delay: options?.delay,
      attempts: options?.attempts,
      jobId: options?.jobId,
      removeOnFail: options?.removeOnFail,
      removeOnComplete: options?.removeOnComplete,
      backoff: options?.backoff
        ? {
            type: options.backoff.type,
            delay: options.backoff.delay,
          }
        : undefined,
    };

    await this.processDepositTransactionSchedule.add(
      PROCESS_DEPOSIT_TRANSACTION,
      data,
      bullmqOptions,
    );
  }

  async removeJobById(id: string): Promise<void> {
    await this.processDepositTransactionSchedule.remove(id);
  }
}
