import { Injectable } from '@nestjs/common';
import {
  UserRepository,
  UserRepositoryFindByUniqueFieldProps,
  UserRepositoryFindManyProps,
} from 'src/domain/wallet/application/repositories/user.repository';
import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import { User, UserKey } from 'src/domain/wallet/entities/user';
import {
  PrismaUserMapper,
  UserWithInclude,
} from '../mappers/prisma-user.mapper';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';
import { PaginationResponse } from 'src/core/types/pagination';
import { User as PrismaUser } from '@generated/index';

export const userKeys: UserKey[] = ['id', 'email'];

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
    include,
  }: UserRepositoryFindByUniqueFieldProps) {
    const cacheKey = buildCacheKey({
      baseKey: `user:${key}:${value}`,
    });
    const cached = await this.redisRepository.get<UserWithInclude>(cacheKey);

    if (cached) {
      if (include?.wallet) {
        if (!cached.wallet) {
          for (const key of Object.keys(cached) as UserKey[]) {
            await this.redisRepository.del(`user:${key}:${cached[key]}`);
          }
        } else {
          return PrismaUserMapper.toDomain(cached);
        }
      }
    }

    const prismaUser = await this.prisma.user.findFirst({
      where: {
        [key]: value,
      },
      include: {
        wallet: include?.wallet,
      },
    });

    if (!prismaUser) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaUser, 180);

    return PrismaUserMapper.toDomain(prismaUser);
  }

  async findMany({
    filters,
    pageIndex,
    pageSize,
  }: UserRepositoryFindManyProps) {
    const cacheKey = buildCacheKey({
      baseKey: `user:all${pageIndex}:${pageSize}`,
      filters,
    });
    const cached =
      await this.redisRepository.get<PaginationResponse<PrismaUser>>(cacheKey);

    if (cached) {
      return {
        ...cached,
        data: cached.data.map(PrismaUserMapper.toDomain),
      };
    }

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          ...(filters?.email && {
            email: {
              contains: filters.email,
              mode: 'insensitive',
            },
          }),
          ...(filters?.not && {
            id: {
              not: filters?.not,
            },
          }),
        },
        orderBy: { name: 'asc' },
        take: pageSize,
      }),
      this.prisma.user.count({
        where: {
          ...(filters?.email && {
            email: {
              contains: filters.email,
              mode: 'insensitive',
            },
          }),
          ...(filters?.not && {
            id: {
              not: filters?.not,
            },
          }),
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / (pageSize || 0));

    const paginatedResponsed = {
      data: users,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return {
      ...paginatedResponsed,
      data: users.map(PrismaUserMapper.toDomain),
    };
  }

  async create(user: User) {
    const data = PrismaUserMapper.toPrisma(user);

    const createdUser = await this.prisma.user.create({
      data,
    });

    return PrismaUserMapper.toDomain(createdUser);
  }

  async save(user: User) {
    const data = PrismaUserMapper.toPrisma(user);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    const promises: Promise<any>[] = [];

    userKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`user:${key}:${data[key]}`),
      );
    });

    await Promise.all(promises);

    return PrismaUserMapper.toDomain(updatedUser);
  }

  async delete(user: User): Promise<void> {
    const data = PrismaUserMapper.toPrisma(user);

    await this.prisma.user.delete({
      where: {
        id: data.id,
      },
    });

    const promises: Promise<any>[] = [];

    userKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`user:${key}:${data[key]}`),
      );
    });

    await Promise.all(promises);
  }
}
