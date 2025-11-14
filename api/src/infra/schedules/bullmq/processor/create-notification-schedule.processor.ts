import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { formatCurrency } from 'src/core/helpers/format-currency';
import { NotificationRepository } from 'src/domain/wallet/application/repositories/notification.repository';
import { CreateNotificationParams } from 'src/domain/wallet/application/schedules/create-notification';
import { Notification } from 'src/domain/wallet/entities/notification';
import { TransactionType } from 'src/domain/wallet/entities/transaction';
import { NotificationGateway } from 'src/infra/events/gateways/socket/notification.gateway';

export const CREATE_NOTIFICATION_SCHEDULE_PROCESSOR =
  'create-notification-processor';

@Processor(CREATE_NOTIFICATION_SCHEDULE_PROCESSOR)
export class BullMQCreateNotificationProcessor extends WorkerHost {
  private logger = new Logger(BullMQCreateNotificationProcessor.name);

  constructor(
    private notificationRepository: NotificationRepository,
    private notificationGateway: NotificationGateway,
  ) {
    super();
  }

  async process(job: Job<CreateNotificationParams>): Promise<void> {
    const { userId, content, title, variables } = job.data;

    const notification = Notification.create({
      title,
      userId: new UniqueEntityID(userId),
      content: '',
    });

    const formattedAmount = variables?.amount
      ? formatCurrency(variables.amount)
      : null;

    switch (title) {
      case 'Depósito confirmado': {
        notification.content = formattedAmount
          ? `Seu depósito de ${formattedAmount} foi confirmado.`
          : 'Seu depósito foi confirmado com sucesso.';
        break;
      }

      case 'Saque confirmado': {
        notification.content = formattedAmount
          ? `Seu saque de ${formattedAmount} foi confirmado.`
          : 'Seu saque foi confirmado.';
        break;
      }

      case 'Transferência enviada': {
        notification.content = variables?.userName
          ? `Você enviou ${formattedAmount} para ${variables.userName}.`
          : 'Transferência enviada com sucesso.';
        break;
      }

      case 'Transferência recebida': {
        notification.content = variables?.userName
          ? `Você recebeu ${formattedAmount} de ${variables.userName}.`
          : 'Transferência recebida com sucesso.';
        break;
      }

      case 'Transferência revertida': {
        if (variables?.userName && formattedAmount) {
          notification.content = variables.isSender
            ? `A transferência de ${formattedAmount} para ${variables.userName} foi revertida. O valor retornou para sua carteira.`
            : `A transferência de ${formattedAmount} enviada por ${variables.userName} foi revertida. O valor foi estornado.`;
        } else {
          notification.content = 'Uma transferência foi revertida.';
        }
        break;
      }

      case 'Operação falhou': {
        if (formattedAmount && variables?.type) {
          const operation =
            variables.type === TransactionType.DEPOSIT
              ? 'depósito'
              : variables.type === TransactionType.TRANSFER
                ? 'transferência'
                : 'saque';

          notification.content = `Seu ${operation} de ${formattedAmount} falhou, tente novamente.`;
        } else {
          notification.content = 'Uma operação falhou';
        }
        break;
      }
    }

    await this.notificationRepository.create(notification);

    this.notificationGateway.newNotification({
      userId: userId,
    });

    this.logger.debug(`Notification for: ${job.data.userId} created`);
  }
}
