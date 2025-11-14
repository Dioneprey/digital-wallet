import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { RedisRepository } from '../../redis/redis.service';
import { PaginationResponse } from 'src/core/types/pagination';
import {
  NotificationRepository,
  NotificationRepositoryFindAllByUserProps,
} from 'src/domain/wallet/application/repositories/notification.repository';
import { Notification } from 'src/domain/wallet/entities/notification';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';
import { PrismaNotificationMapper } from '../mappers/prisma-notification.mapper';
import { Notification as PrismaNotification } from '@generated/index';
@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findById(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return null;
    }

    return PrismaNotificationMapper.toDomain(notification);
  }

  async findAllByUserId({
    userId,
    pageIndex,
    pageSize = 20,
    filters,
  }: NotificationRepositoryFindAllByUserProps) {
    const baseKey = `notification:user:${userId}:${pageIndex}:${pageSize}`;
    const cacheKey = buildCacheKey({ baseKey, filters });

    const cached =
      await this.redisRepository.get<PaginationResponse<PrismaNotification>>(
        cacheKey,
      );

    if (cached) {
      return {
        ...cached,
        data: cached.data.map(PrismaNotificationMapper.toDomain),
      };
    }

    const [notifications, totalCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          ...(filters?.onlyUnseen && {
            readedAt: null,
          }),
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageIndex - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({
        where: {
          ...(filters?.onlyUnseen && {
            readedAt: null,
          }),
          userId: userId,
        },
      }),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedResponsed = {
      data: notifications,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return {
      ...paginatedResponsed,
      data: notifications.map(PrismaNotificationMapper.toDomain),
    };
  }

  async create(notification: Notification) {
    const data = PrismaNotificationMapper.toPrisma(notification);

    const prismaNotification = await this.prisma.notification.create({
      data: data,
    });

    await this.redisRepository.del(`notification:${notification.id}`);
    await this.redisRepository.purgeByPrefix(
      `notification:user:${notification.userId}`,
    );

    return PrismaNotificationMapper.toDomain(prismaNotification);
  }

  async save(notification: Notification) {
    const data = PrismaNotificationMapper.toPrisma(notification);

    await this.prisma.notification.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    await this.redisRepository.del(`notification:${notification.id}`);
    await this.redisRepository.purgeByPrefix(
      `notification:user:${notification.userId}`,
    );
  }
}
