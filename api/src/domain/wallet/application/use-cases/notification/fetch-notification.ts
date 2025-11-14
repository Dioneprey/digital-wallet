import { Either, left, right } from 'src/core/either';
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '../@errors/resource-not-found.error';
import { UserRepository } from '../../repositories/user.repository';
import { NotificationRepository } from '../../repositories/notification.repository';
import { Notification } from 'src/domain/wallet/entities/notification';

interface FetchNotificationsUseCaseRequest {
  userId: string;
  pageIndex: number;
  pageSize: number;
  filters?: {
    onlyUnseen?: boolean;
  };
}

export type FetchNotificationsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    notifications: Notification[];
    pageIndex: number;
    totalCount: number;
    totalPages: number;
  }
>;

@Injectable()
export class FetchNotificationsUseCase {
  constructor(
    private userRepository: UserRepository,
    private notificationRepository: NotificationRepository,
  ) {}

  async execute({
    userId,
    pageIndex,
    pageSize,
    filters,
  }: FetchNotificationsUseCaseRequest): Promise<FetchNotificationsUseCaseResponse> {
    const userExists = await this.userRepository.findByUniqueField({
      key: 'id',
      value: userId,
    });

    if (!userExists) return left(new ResourceNotFoundError(userId));

    const onlyUnseen = filters?.onlyUnseen;

    const notificationsResponse =
      await this.notificationRepository.findAllByUserId({
        pageIndex,
        pageSize,
        userId,
        filters: {
          onlyUnseen,
        },
      });

    const { data, totalCount, totalPages } = notificationsResponse;

    return right({ notifications: data, pageIndex, totalCount, totalPages });
  }
}
