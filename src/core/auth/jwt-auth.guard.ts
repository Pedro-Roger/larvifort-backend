import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  role: string;
}

// TASK 01 slice 3e — JwtAuthGuard real com verificação HS256 via jsonwebtoken.
// Valida o Bearer token do header Authorization, confere assinatura e expiração,
// e popula `req.user` com { id, email, role } para @CurrentUser() e RolesGuard.
// Lê secret de process.env.JWT_SECRET (com fallback de desenvolvimento).
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private getSecret(): string {
    return process.env.JWT_SECRET ?? 'lavifort-dev-secret';
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: AuthenticatedRequestUser;
    }>();
    const auth = req.headers['authorization'];
    const token =
      typeof auth === 'string' && auth.startsWith('Bearer ')
        ? auth.slice(7).trim()
        : '';
    if (!token) {
      throw new UnauthorizedException('Token ausente.');
    }

    try {
      const decoded = jwt.verify(token, this.getSecret()) as JwtPayload & {
        sub?: string;
        email?: string;
        role?: string;
      };

      if (!decoded.sub || !decoded.email || !decoded.role) {
        throw new UnauthorizedException('Token inválido.');
      }

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
