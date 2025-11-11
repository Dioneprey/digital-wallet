import { Injectable } from '@nestjs/common';
import {
  WalletRepository,
  WalletRepositoryFindByUniqueFieldProps,
} from 'src/domain/wallet/application/repositories/wallet.repository';
import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import { Wallet, WalletKey } from 'src/domain/wallet/entities/wallet';
import {
  PrismaWalletMapper,
  WalletWithInclude,
} from '../mappers/prisma-wallet.mapper';
import { userKeys } from './prisma-user.repository';

export const walletKeys: WalletKey[] = ['id', 'userId'];

@Injectable()
export class PrismaWalletRepository implements WalletRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}
  async findByUniqueField({
    key,
    value,
  }: WalletRepositoryFindByUniqueFieldProps) {
    const cacheKey = `wallet:${key}:${value}`;
    const cached = await this.redisRepository.get<WalletWithInclude>(cacheKey);

    if (cached) {
      return PrismaWalletMapper.toDomain(cached);
    }

    const prismaWallet = await this.prisma.wallet.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaWallet) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaWallet, 180);

    return PrismaWalletMapper.toDomain(prismaWallet);
  }

  async create(wallet: Wallet) {
    const data = PrismaWalletMapper.toPrisma(wallet);

    const createdWallet = await this.prisma.wallet.create({
      data,
    });

    return PrismaWalletMapper.toDomain(createdWallet);
  }

  async save(wallet: Wallet) {
    const data = PrismaWalletMapper.toPrisma(wallet);

    const updatedWallet = await this.prisma.wallet.update({
      where: {
        id: data.id,
      },
      data: data,
      include: {
        user: true,
      },
    });

    const promises: Promise<any>[] = [];

    walletKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`wallet:${key}:${data[key]}`),
      );
    });
    userKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `user:${key}:${updatedWallet.user[key]}`,
        ),
      );
    });

    await Promise.all(promises);

    return PrismaWalletMapper.toDomain(updatedWallet);
  }

  async delete(wallet: Wallet): Promise<void> {
    const data = PrismaWalletMapper.toPrisma(wallet);

    const deletedWallet = await this.prisma.wallet.delete({
      where: {
        id: data.id,
      },
      include: {
        user: true,
      },
    });

    const promises: Promise<any>[] = [];

    walletKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`wallet:${key}:${data[key]}`),
      );
    });
    userKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `user:${key}:${deletedWallet.user[key]}`,
        ),
      );
    });

    await Promise.all(promises);
  }
}
