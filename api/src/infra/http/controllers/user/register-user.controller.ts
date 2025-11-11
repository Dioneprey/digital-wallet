import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  Res,
  ConflictException,
} from '@nestjs/common';

import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Public } from 'src/infra/auth/public';
import { FastifyReply } from 'fastify';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnvService } from 'src/infra/env/env.service';
import { RegisterUserUseCase } from 'src/domain/wallet/application/use-cases/user/register-user';
import { ResourceAlreadyExists } from 'src/domain/wallet/application/use-cases/@errors/resource-already-exists.error';

const RegisterUserBodySchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
});

type RegisterUserBodySchema = z.infer<typeof RegisterUserBodySchema>;
const bodyValidationPipe = new ZodValidationPipe(RegisterUserBodySchema);

@ApiTags('user')
@Controller('/user')
@Public()
export class RegisterUserController {
  constructor(
    private registerUser: RegisterUserUseCase,
    private envService: EnvService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a user',
    description: 'Registra um usuário usando email e senha',
  })
  @ApiBody({
    description: 'Dados para registro do usuário',
    schema: {
      example: {
        email: 'user@example.com',
        password: 'senha123',
        name: 'Nome do Usuário',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro realizado com sucesso',
    schema: { example: { message: 'Registration successful' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    schema: { example: { message: 'Resource already exists' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de requisição',
    schema: { example: { message: 'Bad request' } },
  })
  async handle(
    @Body(bodyValidationPipe) body: RegisterUserBodySchema,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { email, password, name } = body;

    const result = await this.registerUser.execute({
      email,
      password,
      name,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceAlreadyExists:
          return new ConflictException(error.message);
        default:
          return new BadRequestException(error.message);
      }
    }

    const { accessToken, refreshToken } = result.value;

    reply
      .setCookie('Authentication', accessToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: Number(this.envService.get('JWT_EXPIRATION')) * 60, // 15 minutos
      })
      .setCookie('RefreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      })
      .send({ message: 'Registration successful' });
  }
}
