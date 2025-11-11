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

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => HttpModule),
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
  ],
  providers: [
    BullMQProcessDepositTransactionProcessor,
    BullMQProcessWithdrawTransactionProcessor,
    BullMQProcessTransferTransactionProcessor,
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
  ],
  exports: [
    BullModule,
    ProcessDepositTransactionSchedule,
    ProcessTransferTransactionSchedule,
    ProcessWithdrawTransactionSchedule,
  ],
})
export class BullMqConfigModule {}
