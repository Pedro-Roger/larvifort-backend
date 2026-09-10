type DiscordAlertInput = {
  status: number;
  method?: string;
  url?: string;
  message?: string;
};

const recentAlerts = new Map<string, number>();
const DEDUPE_WINDOW_MS = 30_000;

function cleanMessage(message: string): string {
  return message.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').slice(0, 500);
}

export function notifyDiscordAlert(input: DiscordAlertInput): void {
  const webhook = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhook) return;

  const method = input.method ?? 'UNKNOWN';
  const url = input.url ?? 'unknown';
  const message = cleanMessage(input.message ?? 'Erro HTTP');
  const key = `${input.status}:${method}:${url}:${message}`;
  const now = Date.now();
  const previous = recentAlerts.get(key);
  if (previous && now - previous < DEDUPE_WINDOW_MS) return;
  recentAlerts.set(key, now);

  const content = [
    '🚨 **LarviFort API — alerta**',
    `Ambiente: ${process.env.NODE_ENV ?? 'development'}`,
    `Status: ${input.status}`,
    `Rota: ${method} ${url}`,
    `Mensagem: ${message}`,
    `Horário: ${new Date(now).toISOString()}`,
  ].join('\n');

  void fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  }).catch(() => undefined);
}
