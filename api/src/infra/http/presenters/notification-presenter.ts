import { Notification } from 'src/domain/wallet/entities/notification';

export class NotificationPresenter {
  static toHTTP(notification: Notification | null) {
    if (notification === null) {
      return {};
    }

    return {
      id: notification.id.toString(),
      userId: notification.userId.toString(),
      title: notification.title,
      content: notification.content,
      readedAt: notification.readedAt ?? null,
      createdAt: notification.createdAt ?? null,
      updatedAt: notification.updatedAt ?? null,
    };
  }
}
