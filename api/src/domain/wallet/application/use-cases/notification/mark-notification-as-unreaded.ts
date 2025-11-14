import { Injectable } from '@nestjs/common'
import { NotificationRepository } from '../../repositories/notification.repository'
import { ResourceNotFoundError } from '../@errors/resource-not-found.error'
import { Either, left, right } from 'src/core/either'

type MarkNotificationAsUnreadedUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class MarkNotificationAsUnreadedUseCase {
  constructor(
    private readonly notificationRespository: NotificationRepository
  ) {}

  async execute(
    notificationId: string
  ): Promise<MarkNotificationAsUnreadedUseCaseResponse> {
    const notification =
      await this.notificationRespository.findById(notificationId)

    if (!notification) {
      return left(
        new ResourceNotFoundError(`Notification with id: ${notificationId}`)
      )
    }

    notification.readedAt = null

    await this.notificationRespository.save(notification)

    return right(null)
  }
}
