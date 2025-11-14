import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvModule } from 'src/infra/env/env.module';
import { EnvService } from 'src/infra/env/env.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { DatabaseModule } from 'src/infra/database/database.module';
import { HttpModule } from 'src/infra/http/http.module';

import { BullMQProcessDepositTransactionScheduleScheduleService } from './service/bullmq-process-deposit-transaction-schedule.service';
import { ProcessDepositTransactionSchedule } from 'src/domain/wallet/application/schedules/process-deposit-transaction.schedule';
import { ProcessTransferTransactionSchedule } from 'src/domain/wallet/application/schedules/process-transfer-transaction.schedule';
import { ProcessWithdrawTransactionSchedule } from 'src/domain/wallet/application/schedules/process-withdraw-transaction.schedule';
import { BullMQProcessTransferTransactionScheduleScheduleService } from './service/bullmq-process-transfer-transaction-schedule.service';
import { BullMQProcessWithdrawTransactionScheduleScheduleService } from './service/bullmq-process-withdraw-transaction-schedule.service';
import {
  BullMQProcessDepositTransactionProcessor,
  PROCESS_DEPOSIT_TRANSACTION,
} from './processor/bullmq-process-deposit-transaction.processor';
import {
  BullMQProcessWithdrawTransactionProcessor,
  PROCESS_WITHDRAW_TRANSACTION,
} from './processor/bullmq-process-withdraw-transaction.processor';
import {
  BullMQProcessTransferTransactionProcessor,
  PROCESS_TRANSFER_TRANSACTION,
} from './processor/bullmq-process-transfer-transaction.processor';
import {
  BullMQProcessReverseTransactionProcessor,
  PROCESS_REVERSE_TRANSFER_TRANSACTION,
} from './processor/bullmq-process-reverse-transfer-transaction.processor';
import { ProcessReverseTransferTransactionSchedule } from 'src/domain/wallet/application/schedules/process-reverse-transfer-transaction.schedule';
import { BullMQProcessReverseTransactionScheduleService } from './service/bullmq-process-reverse-transfer-transaction-schedule.service';
import {
  BullMQCreateNotificationProcessor,
  CREATE_NOTIFICATION_SCHEDULE_PROCESSOR,
} from './processor/create-notification-schedule.processor';
import { BullMQCreateNotificationScheduleService } from './service/bullmq-create-notification-schedule.service';
import { CreateNotificationSchedule } from 'src/domain/wallet/application/schedules/create-notification';
import { EventsModule } from 'src/infra/events/events.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => HttpModule),
    EventsModule,
    BullModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        connection: {
          host: envService.get('REDIS_HOST'),
          port: envService.get('REDIS_PORT'),
          password: envService.get('REDIS_PASSWORD'),
          db: 1,
        },
      }),
    }),
    BullModule.registerQueue({
      name: PROCESS_DEPOSIT_TRANSACTION,
    }),
    BullModule.registerQueue({
      name: PROCESS_WITHDRAW_TRANSACTION,
    }),
    BullModule.registerQueue({
      name: PROCESS_TRANSFER_TRANSACTION,
    }),
    BullModule.registerQueue({
      name: PROCESS_REVERSE_TRANSFER_TRANSACTION,
    }),
    BullModule.registerQueue({
      name: CREATE_NOTIFICATION_SCHEDULE_PROCESSOR,
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: FastifyAdapter,
    }),
    BullBoardModule.forFeature({
      name: PROCESS_DEPOSIT_TRANSACTION,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: PROCESS_WITHDRAW_TRANSACTION,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: PROCESS_TRANSFER_TRANSACTION,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: PROCESS_REVERSE_TRANSFER_TRANSACTION,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: CREATE_NOTIFICATION_SCHEDULE_PROCESSOR,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    BullMQProcessDepositTransactionProcessor,
    BullMQProcessWithdrawTransactionProcessor,
    BullMQProcessTransferTransactionProcessor,
    BullMQProcessReverseTransactionProcessor,
    BullMQCreateNotificationProcessor,
    {
      provide: ProcessDepositTransactionSchedule,
      useClass: BullMQProcessDepositTransactionScheduleScheduleService,
    },
    {
      provide: ProcessTransferTransactionSchedule,
      useClass: BullMQProcessTransferTransactionScheduleScheduleService,
    },
    {
      provide: ProcessWithdrawTransactionSchedule,
      useClass: BullMQProcessWithdrawTransactionScheduleScheduleService,
    },
    {
      provide: ProcessReverseTransferTransactionSchedule,
      useClass: BullMQProcessReverseTransactionScheduleService,
    },
    {
      provide: CreateNotificationSchedule,
      useClass: BullMQCreateNotificationScheduleService,
    },
  ],
  exports: [
    BullModule,
    ProcessDepositTransactionSchedule,
    ProcessTransferTransactionSchedule,
    ProcessWithdrawTransactionSchedule,
    ProcessReverseTransferTransactionSchedule,
    CreateNotificationSchedule,
  ],
})
export class BullMqConfigModule {}
