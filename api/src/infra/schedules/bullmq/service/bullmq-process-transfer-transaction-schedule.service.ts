import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

import { ScheduleOptions } from 'src/core/types/schedule-options';

import { PROCESS_TRANSFER_TRANSACTION } from '../processor/bullmq-process-transfer-transaction.processor';
import {
  ProcessTransferTransactionParams,
  ProcessTransferTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-transfer-transaction.schedule';

@Injectable()
export class BullMQProcessTransferTransactionScheduleScheduleService
  implements ProcessTransferTransactionSchedule
{
  constructor(
    @InjectQueue(PROCESS_TRANSFER_TRANSACTION)
    private readonly processTransferTransactionSchedule: Queue<ProcessTransferTransactionParams>,
  ) {}

  async enqueueJob(
    data: ProcessTransferTransactionParams,
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

    await this.processTransferTransactionSchedule.add(
      PROCESS_TRANSFER_TRANSACTION,
      data,
      bullmqOptions,
    );
  }

  async removeJobById(id: string): Promise<void> {
    await this.processTransferTransactionSchedule.remove(id);
  }
}
