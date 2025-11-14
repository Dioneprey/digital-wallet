import { PaginationProps, PaginationResponse } from 'src/core/types/pagination';
import { Notification } from '../../entities/notification';

interface NotificationRepositoryFindAllByUserFilters {
  onlyUnseen?: boolean;
}
export interface NotificationRepositoryFindAllByUserProps
  extends PaginationProps<NotificationRepositoryFindAllByUserFilters> {
  userId: string;
}

export abstract class NotificationRepository {
  abstract findById(notificationId: string): Promise<Notification | null>;
  abstract findAllByUserId({
    pageIndex,
    userId,
  }: NotificationRepositoryFindAllByUserProps): Promise<
    PaginationResponse<Notification>
  >;

  abstract create(notification: Partial<Notification>): Promise<Notification>;
  abstract save(notification: Notification): Promise<void>;
}
