import { Prisma, Notification as PrismaNotification } from '@generated/index';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Notification } from 'src/domain/wallet/entities/notification';

export type NotificationWithInclude = PrismaNotification & {};

export class PrismaNotificationMapper {
  static toDomain(raw: NotificationWithInclude): Notification {
    return Notification.create(
      {
        ...raw,
        userId: new UniqueEntityID(raw.userId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    notification: Notification,
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      id: notification.id.toString(),
      userId: notification.userId.toString(),
      title: notification.title,
      content: notification.content,
      readedAt: notification.readedAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
