import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRole, ROLES_KEY } from './roles.decorator';

// Libera rotas sem `@Roles(...)`; exige `request.user.role` nas demais.
// Só ADMIN promove role / cria team (regra da TASK 02, aplicada aqui).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }
    const req = context
      .switchToHttp()
      .getRequest<{ user?: { role?: AppRole } }>();
    const role = req.user?.role;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Acesso negado.');
    }
    return true;
  }
}
