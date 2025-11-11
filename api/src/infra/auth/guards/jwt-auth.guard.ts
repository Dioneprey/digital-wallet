import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../public';
import { Reflector } from '@nestjs/core';
import { UserPayload } from 'src/core/types/user-payload';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    const cookieToken = request.cookies?.Authentication;

    const token = bearerToken || cookieToken;

    if (!token && isPublic) {
      return true;
    }

    try {
      // Se há token, tenta autenticar normalmente
      const canActivate = (await super.canActivate(context)) as boolean;

      const user = request.user as UserPayload;

      return canActivate;
    } catch (err) {
      // Se a rota é pública, ignora o erro de token inválido
      if (isPublic) {
        // limpa o user pra evitar payload inválido
        request.user = undefined;
        return true;
      }

      throw new UnauthorizedException('Missing or invalid token');
    }
  }
}
