import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

import { ScheduleOptions } from 'src/core/types/schedule-options';

import {
  ProcessReverseTransferTransactionParams,
  ProcessReverseTransferTransactionSchedule,
} from 'src/domain/wallet/application/schedules/process-reverse-transfer-transaction.schedule';
import { PROCESS_REVERSE_TRANSFER_TRANSACTION } from '../processor/bullmq-process-reverse-transfer-transaction.processor';

@Injectable()
export class BullMQProcessReverseTransactionScheduleService
  implements ProcessReverseTransferTransactionSchedule
{
  constructor(
    @InjectQueue(PROCESS_REVERSE_TRANSFER_TRANSACTION)
    private readonly processReverseTransactionSchedule: Queue<ProcessReverseTransferTransactionParams>,
  ) {}

  async enqueueJob(
    data: ProcessReverseTransferTransactionParams,
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

    await this.processReverseTransactionSchedule.add(
      PROCESS_REVERSE_TRANSFER_TRANSACTION,
      data,
      bullmqOptions,
    );
  }

  async removeJobById(id: string): Promise<void> {
    await this.processReverseTransactionSchedule.remove(id);
  }
}
