import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { UserFactory } from 'test/factories/make-user';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupFastifyTestApp } from 'test/setup-fastify-e2e';
import { RawServerDefault } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { WalletFactory } from 'test/factories/make-wallet';
import { TransactionFactory } from 'test/factories/make-transaction';
import {
  TransactionStatus,
  TransactionType,
} from 'src/domain/wallet/entities/transaction';

describe('Reverse transfer transaction (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let transactionFactory: TransactionFactory;
  let walletFactory: WalletFactory;

  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, WalletFactory, TransactionFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    transactionFactory = moduleRef.get(TransactionFactory);
    walletFactory = moduleRef.get(WalletFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[PATCH] /transactions/:transactionId/reverse', async () => {
    const user = await userFactory.makePrismaUser({});
    const fromWallett = await walletFactory.makePrismaWallet({
      userId: user.id,
      balance: 5000,
    });

    const toUser = await userFactory.makePrismaUser({});
    const toWallett = await walletFactory.makePrismaWallet({
      userId: toUser.id,
    });

    const transaction = await transactionFactory.makePrismaTransaction({
      fromWalletId: fromWallett.id,
      toWalletId: toWallett.id,
      amount: 2500,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    });

    const response = await request(app.getHttpServer())
      .patch(`/transactions/${transaction.id.toString()}/reverse`)
      .send({
        reason: 'Devolve meu dinheiro',
      })
      .set('Cookie', [`Authentication=${accessToken}`]);

    expect(response.statusCode).toBe(200);
  });
});
