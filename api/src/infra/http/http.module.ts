import { forwardRef, Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { DatabaseModule } from '../database/database.module';
import { HealthController } from './controllers/health.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthenticateController } from './controllers/auth/authenticate.controller';
import { RefreshTokenController } from './controllers/auth/refresh-token.controller';
import { RegisterUserController } from './controllers/user/register-user.controller';
import { CreateDepositTransactionController } from './controllers/transaction/deposit/create-deposit-transaction.controller';
import { CreateWithdrawTransactionController } from './controllers/transaction/withdraw/withdraw-transaction.controller';
import { CreateTransferTransactionController } from './controllers/transaction/transfer/create-transfer-transaction.controller';
import { GetWalletBalanceController } from './controllers/wallet/get-wallet-balance.controller';
import { AuthenticateUseCase } from 'src/domain/wallet/application/use-cases/auth/authenticate';
import { RefreshTokenUseCase } from 'src/domain/wallet/application/use-cases/auth/refresh-token';
import { CreateDepositTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/deposit/create-deposit-transaction';
import { CreateTransferTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/transfer/create-transfer-transaction';
import { CreateWithdrawTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/withdraw/create-withdraw-transaction';
import { RegisterUserUseCase } from 'src/domain/wallet/application/use-cases/user/register-user';
import { GetWalletBalanceUseCase } from 'src/domain/wallet/application/use-cases/wallet/get-wallet-balance';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { UpdateTransactionOnErrorUseCase } from 'src/domain/wallet/application/use-cases/transactions/handle-transaction-error';
import { ProcessDepositTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/deposit/process-deposit-transaction';
import { ProcessWithdrawTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/withdraw/process-withdraw-deposit-transaction';
import { ProcessTransferTransactionUseCase } from 'src/domain/wallet/application/use-cases/transactions/transfer/process-transfer-deposit-transaction';
import { BullMqConfigModule } from '../schedules/bullmq/bullmq.module';
import { FetchTransactionsUseCase } from 'src/domain/wallet/application/use-cases/transactions/fetch-transactions';
import { FetchTransactionsController } from './controllers/transaction/fetch-transactions.controller';
import { GetMeController } from './controllers/user/me.controller';
import { MeUseCase } from 'src/domain/wallet/application/use-cases/user/me';

@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    AuthModule,
    CryptographyModule,
    forwardRef(() => BullMqConfigModule),
  ],
  controllers: [
    HealthController,
    // Auth
    AuthenticateController,
    RefreshTokenController,

    // User
    RegisterUserController,
    GetMeController,

    // Wallet
    GetWalletBalanceController,

    // Transaction
    CreateDepositTransactionController,
    CreateWithdrawTransactionController,
    CreateTransferTransactionController,
    FetchTransactionsController,
  ],
  providers: [
    // Atuh
    AuthenticateUseCase,
    RefreshTokenUseCase,

    // User
    RegisterUserUseCase,
    MeUseCase,

    // Wallet
    GetWalletBalanceUseCase,

    // Transaction
    UpdateTransactionOnErrorUseCase,
    CreateDepositTransactionUseCase,
    ProcessDepositTransactionUseCase,
    CreateWithdrawTransactionUseCase,
    ProcessWithdrawTransactionUseCase,
    CreateTransferTransactionUseCase,
    ProcessTransferTransactionUseCase,
    FetchTransactionsUseCase,
  ],
  exports: [
    UpdateTransactionOnErrorUseCase,
    ProcessDepositTransactionUseCase,
    ProcessTransferTransactionUseCase,
    ProcessWithdrawTransactionUseCase,
  ],
})
export class HttpModule {}
