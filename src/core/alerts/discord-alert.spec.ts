import { notifyDiscordAlert } from './discord-alert';

describe('notifyDiscordAlert', () => {
  const originalWebhook = process.env.DISCORD_WEBHOOK_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    process.env.DISCORD_WEBHOOK_URL = originalWebhook;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('envia alerta sem incluir dados de autenticação', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/webhook';

    notifyDiscordAlert({
      status: 500,
      method: 'POST',
      url: '/api/v1/auth/login',
      message: 'Falha interna',
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://discord.test/webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.not.stringContaining('Authorization'),
      }),
    );
    expect(fetchMock.mock.calls[0][1].body).not.toContain('password');
  });
});
