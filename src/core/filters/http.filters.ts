import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

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
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      return res
        .status(exception.getStatus())
        .json(
          typeof body === 'string'
            ? { statusCode: exception.getStatus(), message: body }
            : body,
        );
    }
    return res.status(500).json({ statusCode: 500, message: 'Erro interno.' });
  }
}
