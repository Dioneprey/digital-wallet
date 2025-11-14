import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisRepository } from './redis/redis.service';
import { EnvModule } from '../env/env.module';
import { UserRepository } from 'src/domain/wallet/application/repositories/user.repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user.repository';
import { CodeRepository } from 'src/domain/wallet/application/repositories/code.repository';
import { PrismaCodeRepository } from './prisma/repositories/prisma-code.repository';
import { TransactionRepository } from 'src/domain/wallet/application/repositories/transaction.repository';
import { PrismaTransactionRepository } from './prisma/repositories/prisma-transaction.repository';
import { WalletRepository } from 'src/domain/wallet/application/repositories/wallet.repository';
import { PrismaWalletRepository } from './prisma/repositories/prisma-wallet.repository';
import { NotificationRepository } from 'src/domain/wallet/application/repositories/notification.repository';
import { PrismaNotificationRepository } from './prisma/repositories/prisma-notification-repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    RedisRepository,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: CodeRepository,
      useClass: PrismaCodeRepository,
    },
    {
      provide: TransactionRepository,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: WalletRepository,
      useClass: PrismaWalletRepository,
    },
    {
      provide: NotificationRepository,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    CodeRepository,
    TransactionRepository,
    WalletRepository,
    NotificationRepository,
  ],
})
export class DatabaseModule {}
