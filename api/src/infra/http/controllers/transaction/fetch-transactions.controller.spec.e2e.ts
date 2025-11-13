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
import { hash } from 'bcryptjs';
import { TransactionFactory } from 'test/factories/make-transaction';
import { WalletFactory } from 'test/factories/make-wallet';

describe('Fetch transactions (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let walletFactory: WalletFactory;
  let transactionFactory: TransactionFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, TransactionFactory, WalletFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    walletFactory = moduleRef.get(WalletFactory);
    transactionFactory = moduleRef.get(TransactionFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /transactions', async () => {
    const user = await userFactory.makePrismaUser({});

    const wallet = await walletFactory.makePrismaWallet({
      userId: user.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    });

    await transactionFactory.makePrismaTransaction({
      fromWalletId: wallet.id,
    });

    const response = await request(app.getHttpServer())
      .get('/transactions')
      .query({ pageSize: 10 })
      .set('Cookie', [`Authentication=${accessToken}`]);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.transactions)).toBe(true);
    expect(response.body.transactions).toHaveLength(1);
    expect(response.body.meta.pageSize).toBe(10);
  });
});
