import { Injectable } from '@nestjs/common';
import {
  TransactionRepository,
  TransactionRepositoryFindByUniqueFieldProps,
  TransactionRepositoryFindManyProps,
} from 'src/domain/wallet/application/repositories/transaction.repository';
import { PrismaService } from '../prisma.service';
import { RedisRepository } from '../../redis/redis.service';
import {
  Transaction,
  TransactionKey,
  TransactionStatus,
} from 'src/domain/wallet/entities/transaction';
import {
  PrismaTransactionMapper,
  TransactionWithInclude,
} from '../mappers/prisma-transaction.mapper';
import { Wallet } from 'src/domain/wallet/entities/wallet';
import { PrismaWalletMapper } from '../mappers/prisma-wallet.mapper';
import { walletKeys } from './prisma-wallet.repository';
import { userKeys } from './prisma-user.repository';
import { buildCacheKey } from 'src/core/helpers/buid-cache-key';
import { PaginationResponse } from 'src/core/types/pagination';
import {
  Transaction as PrismaTransaction,
  TransactionType,
} from '@generated/index';

const transactionKeys: TransactionKey[] = ['id', 'id'];

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(
    private prisma: PrismaService,
    private redisRepository: RedisRepository,
  ) {}

  async findByUniqueField({
    key,
    value,
  }: TransactionRepositoryFindByUniqueFieldProps) {
    const cacheKey = buildCacheKey({
      baseKey: `transaction:${key}:${value}`,
    });
    const cached =
      await this.redisRepository.get<TransactionWithInclude>(cacheKey);

    if (cached) {
      return PrismaTransactionMapper.toDomain(cached);
    }

    const prismaTransaction = await this.prisma.transaction.findFirst({
      where: {
        [key]: value,
      },
    });

    if (!prismaTransaction) {
      return null;
    }

    await this.redisRepository.set(cacheKey, prismaTransaction, 180);

    return PrismaTransactionMapper.toDomain(prismaTransaction);
  }

  async findMany({
    filters,
    pageIndex,
    pageSize,
  }: TransactionRepositoryFindManyProps) {
    const cacheKey = buildCacheKey({
      baseKey: `transaction:all:wallet:${filters!.walletId}${pageIndex}:${pageSize}`,
      filters,
    });

    const cached =
      await this.redisRepository.get<PaginationResponse<PrismaTransaction>>(
        cacheKey,
      );

    if (cached) {
      return {
        ...cached,
        data: cached.data.map(PrismaTransactionMapper.toDomain),
      };
    }

    const [transactions, totalCount] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          ...(filters?.type && {
            type: filters.type as TransactionType,
          }),
          ...(filters?.status && {
            status: filters.status as TransactionStatus,
          }),
          ...(filters?.walletId && {
            OR: [
              {
                fromWalletId: filters.walletId,
              },
              {
                toWalletId: filters.walletId,
              },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
        ...(pageIndex && pageSize
          ? {
              skip: (pageIndex - 1) * pageSize,
              take: pageSize,
            }
          : {}),
      }),
      this.prisma.transaction.count({
        where: {
          ...(filters?.type && {
            type: filters.type as TransactionType,
          }),
          ...(filters?.status && {
            status: filters.status as TransactionStatus,
          }),
          ...(filters?.walletId && {
            OR: [
              {
                fromWalletId: filters.walletId,
              },
              {
                toWalletId: filters.walletId,
              },
            ],
          }),
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / (pageSize || 0));

    const paginatedResponsed = {
      data: transactions,
      pageIndex,
      totalCount,
      totalPages,
    };

    await this.redisRepository.set(cacheKey, paginatedResponsed, 180);

    return {
      ...paginatedResponsed,
      data: transactions.map(PrismaTransactionMapper.toDomain),
    };
  }

  async create(transaction: Transaction) {
    const data = PrismaTransactionMapper.toPrisma(transaction);

    const createdTransaction = await this.prisma.transaction.create({
      data,
    });

    return PrismaTransactionMapper.toDomain(createdTransaction);
  }

  async applyTransactionToWallet(data: {
    wallet: Wallet;
    transaction: Transaction;
  }): Promise<{ wallet: Wallet; transaction: Transaction }> {
    const { wallet, transaction } = data;

    const transactionData = PrismaTransactionMapper.toPrisma(transaction);
    const walletData = PrismaWalletMapper.toPrisma(wallet);

    const [updatedWallet, updatedTransaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id.toString() },
        data: walletData,
        include: {
          user: true,
        },
      }),
      this.prisma.transaction.update({
        where: { id: transaction.id.toString() },
        data: transactionData,
      }),
    ]);

    const promises: Promise<any>[] = [];

    walletKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`wallet:${key}:${walletData[key]}`),
      );
    });
    transactionKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `transaction:${key}:${transactionData[key]}`,
        ),
      );
    });
    userKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `user:${key}:${updatedWallet.user[key]}`,
        ),
      );
    });
    promises.push(
      this.redisRepository.purgeByPrefix(
        `transaction:all:wallet:${wallet.id.toString()}`,
      ),
    );

    await Promise.all(promises);

    return {
      wallet: PrismaWalletMapper.toDomain(updatedWallet),
      transaction: PrismaTransactionMapper.toDomain(updatedTransaction),
    };
  }

  async applyTransferBetweenWallets(data: {
    fromWallet: Wallet;
    toWallet: Wallet;
    transaction: Transaction;
  }): Promise<{
    fromWallet: Wallet;
    toWallet: Wallet;
    transaction: Transaction;
  }> {
    const { fromWallet, toWallet, transaction } = data;

    const transactionData = PrismaTransactionMapper.toPrisma(transaction);
    const fromWalletData = PrismaWalletMapper.toPrisma(fromWallet);
    const toWalletData = PrismaWalletMapper.toPrisma(toWallet);

    const [updatedFromWallet, updatedToWallet, updatedTransaction] =
      await this.prisma.$transaction([
        this.prisma.wallet.update({
          where: { id: fromWallet.id.toString() },
          data: fromWalletData,
          include: {
            user: true,
          },
        }),
        this.prisma.wallet.update({
          where: { id: toWallet.id.toString() },
          data: toWalletData,
          include: {
            user: true,
          },
        }),
        this.prisma.transaction.update({
          where: { id: transaction.id.toString() },
          data: transactionData,
        }),
      ]);

    const promises: Promise<any>[] = [];

    walletKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `wallet:${key}:${updatedToWallet[key]}`,
        ),
        this.redisRepository.purgeByPrefix(
          `wallet:${key}:${fromWalletData[key]}`,
        ),
      );
    });
    promises.push(
      this.redisRepository.purgeByPrefix(
        `transaction:all:wallet:${fromWallet.id.toString()}`,
      ),
      this.redisRepository.purgeByPrefix(
        `transaction:all:wallet:${toWallet.id.toString()}`,
      ),
    );
    transactionKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `transaction:${key}:${transactionData[key]}`,
        ),
      );
    });
    userKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(
          `user:${key}:${updatedToWallet.user[key]}`,
        ),
        this.redisRepository.purgeByPrefix(
          `user:${key}:${updatedToWallet.user[key]}`,
        ),
      );
    });

    await Promise.all(promises);

    return {
      fromWallet: PrismaWalletMapper.toDomain(updatedFromWallet),
      toWallet: PrismaWalletMapper.toDomain(updatedToWallet),
      transaction: PrismaTransactionMapper.toDomain(updatedTransaction),
    };
  }

  async save(transaction: Transaction) {
    const data = PrismaTransactionMapper.toPrisma(transaction);

    const updatedTransaction = await this.prisma.transaction.update({
      where: {
        id: data.id,
      },
      data: data,
    });

    const promises: Promise<any>[] = [];

    transactionKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`transaction:${key}:${data[key]}`),
      );
    });

    await Promise.all(promises);

    return PrismaTransactionMapper.toDomain(updatedTransaction);
  }

  async delete(transaction: Transaction): Promise<void> {
    const data = PrismaTransactionMapper.toPrisma(transaction);

    await this.prisma.transaction.delete({
      where: {
        id: data.id,
      },
    });

    const promises: Promise<any>[] = [];

    transactionKeys.forEach((key) => {
      promises.push(
        this.redisRepository.purgeByPrefix(`transaction:${key}:${data[key]}`),
      );
    });

    await Promise.all(promises);
  }
}
