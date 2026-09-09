import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Extrai `request.user` (populado pelo JwtAuthGuard/TASK 01).
// `@CurrentUser() user` → objeto; `@CurrentUser('id') id` → campo.
export function extractCurrentUser(
  req: { user?: unknown },
  data?: string,
): unknown {
  const user = req.user;
  if (user === undefined || user === null) {
    return undefined;
  }
  if (typeof data === 'string') {
    return (user as Record<string, unknown>)[data];
  }
  return user;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<{ user?: unknown }>();
    return extractCurrentUser(req, data);
  },
);
