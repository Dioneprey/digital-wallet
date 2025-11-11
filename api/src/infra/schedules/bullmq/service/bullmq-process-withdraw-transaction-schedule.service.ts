import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

import { ScheduleOptions } from 'src/core/types/schedule-options';

import { PROCESS_WITHDRAW_TRANSACTION } from '../processor/bullmq-process-withdraw-transaction.processor';
import {
  ProcessWithdrawTransactionParams,
  ProcessWithdrawTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-withdraw-transaction.schedule';

@Injectable()
export class BullMQProcessWithdrawTransactionScheduleScheduleService
  implements ProcessWithdrawTransactionSchedule
{
  constructor(
    @InjectQueue(PROCESS_WITHDRAW_TRANSACTION)
    private readonly processWithdrawTransactionSchedule: Queue<ProcessWithdrawTransactionParams>,
  ) {}

  async enqueueJob(
    data: ProcessWithdrawTransactionParams,
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

    await this.processWithdrawTransactionSchedule.add(
      PROCESS_WITHDRAW_TRANSACTION,
      data,
      bullmqOptions,
    );
  }

  async removeJobById(id: string): Promise<void> {
    await this.processWithdrawTransactionSchedule.remove(id);
  }
}
