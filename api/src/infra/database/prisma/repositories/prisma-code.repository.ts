import { Injectable } from '@nestjs/common';
import {
  CodeRepository,
  CodeRepositoryDeleteByUserIdProps,
  CodeRepositoryFindByUniqueFieldProps,
} from 'src/domain/wallet/application/repositories/code.repository';
import { PrismaService } from '../prisma.service';
import { Code, CodeKey } from 'src/domain/wallet/entities/code';
import {
  CodeWithInclude,
  PrismaCodeMapper,
} from '../mappers/prisma-code.mapper';
import { RedisRepository } from '../../redis/redis.service';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';

const codeKeys: CodeKey[] = ['id', 'value'];

@Injectable()
export class PrismaCodeRepository implements CodeRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
  }: CodeRepositoryFindByUniqueFieldProps) {
    const cacheKey = buildCacheKey({
      baseKey: `code:${key}:${value}`,
    });
    const cached = await this.redisRepository.get<CodeWithInclude>(cacheKey);

    if (cached) {
      return PrismaCodeMapper.toDomain(cached);
    }

    const prismaCode = await this.prisma.code.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaCode) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaCode, 180);

    return PrismaCodeMapper.toDomain(prismaCode);
  }

  async create(code: Code) {
    const data = PrismaCodeMapper.toPrisma(code);

    const createdCode = await this.prisma.code.create({
      data: data,
    });

    return PrismaCodeMapper.toDomain(createdCode);
  }

  async save(code: Code) {
    const data = PrismaCodeMapper.toPrisma(code);

    const editedCode = await this.prisma.code.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    const promises: Promise<any>[] = [];

    codeKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`code:${key}:${data[key]}`),
      );
    });

    await Promise.all(promises);

    return PrismaCodeMapper.toDomain(editedCode);
  }

  async deleteByUserId({
    userId,
    type,
  }: CodeRepositoryDeleteByUserIdProps): Promise<void> {
    await this.prisma.code.deleteMany({
      where: {
        userId,
        type,
      },
    });

    await this.redisRepository.purgeByPrefix(`code`);
  }

  async delete(code: Code) {
    const data = PrismaCodeMapper.toPrisma(code);

    await this.prisma.code.delete({
      where: {
        id: data.id,
      },
    });

    const promises: Promise<any>[] = [];

    codeKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`code:${key}:${data[key]}`),
      );
    });

    await Promise.all(promises);
  }
}
