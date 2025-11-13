import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/infra/app.module';
import { hash } from 'bcryptjs';
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

describe('Get Wallet balance (E2E)', () => {
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

  test('[GET] /wallet', async () => {
    const user = await userFactory.makePrismaUser({});
    await walletFactory.makePrismaWallet({
      userId: user.id,
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    });

    const response = await request(app.getHttpServer())
      .get('/wallet')
      .set('Cookie', [`Authentication=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.wallet).toEqual(
      expect.objectContaining({
        userId: user.id.toString(),
      }),
    );
  });
});
