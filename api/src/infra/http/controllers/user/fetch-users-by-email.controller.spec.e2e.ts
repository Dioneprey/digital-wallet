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

describe('Fetch users by email (E2E)', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupFastifyTestApp(
      app as unknown as NestFastifyApplication<RawServerDefault>,
    );

    userFactory = moduleRef.get(UserFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('[GET] /users?email=', async () => {
    const user = await userFactory.makePrismaUser({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: await hash('123456', 8),
    });

    const exampleUser = await userFactory.makePrismaUser({
      name: 'John Example',
      email: 'example@gmail.com',
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
    });

    const response = await request(app.getHttpServer())
      .get('/users')
      .query({ email: exampleUser.email, pageSize: 10 })
      .set('Cookie', [`Authentication=${accessToken}`]);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.meta.pageSize).toBe(10);
  });
});
