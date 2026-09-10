import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { notifyDiscordAlert } from '../alerts/discord-alert';

type RequestInfo = { method?: string; originalUrl?: string; url?: string };

// Traduz erros do Prisma (formato { code: 'Pxxxx' }) para HTTP. Não vazar detalhe interno.
// Nota Prisma 7: a classe de erro não é mais exposta como valor estável p/ @Catch(),
// por isso detectamos pelo shape e delegamos o restante ao AppExceptionFilter.
@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const code = (exception as { code?: unknown }).code;
    if (typeof code !== 'string' || !/^P\d{4}$/.test(code)) {
      new AppExceptionFilter().catch(exception, host);
      return;
    }
    const map: Record<string, number> = {
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
      P2003: HttpStatus.BAD_REQUEST,
    };
    const status = map[code] ?? HttpStatus.BAD_REQUEST;
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestInfo>();
    notifyDiscordAlert({
      status,
      method: req.method,
      url: req.originalUrl ?? req.url,
      message: `Prisma ${code}`,
    });
    res.status(status).json({
      statusCode: status,
      message:
        code === 'P2002'
          ? 'Registro duplicado.'
          : code === 'P2025'
            ? 'Registro não encontrado.'
            : 'Erro de persistência.',
      code,
    });
  }
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<RequestInfo>();
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      notifyDiscordAlert({
        status: exception.getStatus(),
        method: req.method,
        url: req.originalUrl ?? req.url,
        message:
          typeof body === 'string'
            ? body
            : typeof body === 'object' && body !== null && 'message' in body
              ? String((body as { message?: unknown }).message)
              : exception.message,
      });
      return res
        .status(exception.getStatus())
        .json(
          typeof body === 'string'
            ? { statusCode: exception.getStatus(), message: body }
            : body,
        );
    }
    notifyDiscordAlert({
      status: 500,
      method: req.method,
      url: req.originalUrl ?? req.url,
      message: 'Erro interno não tratado',
    });
    return res.status(500).json({ statusCode: 500, message: 'Erro interno.' });
  }
}
