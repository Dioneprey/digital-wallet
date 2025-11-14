import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '../@errors/resource-not-found.error'
import { Either, left, right } from 'src/core/either'
import { NotificationRepository } from '../../repositories/notification.repository'

type MarkNotificationAsReadedUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class MarkNotificationAsReadedUseCase {
  constructor(
    private readonly notificationRespository: NotificationRepository
  ) {}

  async execute(
    notificationId: string
  ): Promise<MarkNotificationAsReadedUseCaseResponse> {
    const notification =
      await this.notificationRespository.findById(notificationId)

    if (!notification) {
      return left(
        new ResourceNotFoundError(`Notification with id: ${notificationId}`)
      )
    }

    notification.readedAt = new Date()

    await this.notificationRespository.save(notification)

    return right(null)
  }
}
