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

describe('Register withdraw transaction (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let walletFactory: WalletFactory;

  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, WalletFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    walletFactory = moduleRef.get(WalletFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[POST] /transactions/withdraw', async () => {
    const user = await userFactory.makePrismaUser({});
    await walletFactory.makePrismaWallet({
      userId: user.id,
      balance: 5000,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    });

    const response = await request(app.getHttpServer())
      .post('/transactions/withdraw')
      .send({
        amount: 5000,
      })
      .set('Cookie', [`Authentication=${accessToken}`]);

    expect(response.statusCode).toBe(201);
    expect(response.body.transaction.amount).toEqual(5000);
  });
});
