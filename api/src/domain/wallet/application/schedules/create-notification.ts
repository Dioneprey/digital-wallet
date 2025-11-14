import { ScheduleOptions } from 'src/core/types/schedule-options';
import { TransactionType } from '../../entities/transaction';

export type NotificationTitles =
  | 'Depósito confirmado'
  | 'Saque confirmado'
  | 'Transferência enviada'
  | 'Transferência recebida'
  | 'Transferência revertida'
  | 'Operação falhou';

export interface CreateNotificationParams {
  userId: string;
  title: NotificationTitles;
  content?: string;
  variables?: {
    userName?: string;
    amount?: number;
    type?: TransactionType;
    isSender?: boolean;
  };
}

export abstract class CreateNotificationSchedule {
  abstract enqueueJob(
    data: CreateNotificationParams,
    options?: ScheduleOptions,
  ): Promise<void>;
}
