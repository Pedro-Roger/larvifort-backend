import { MetricsUseCases } from './metrics.usecases';
import { MetricsRepository } from './metrics.repository';

const team = {
  id: 't1',
  name: 'Comercial',
  members: [{ id: 'u1', name: 'Ana' }],
};
const actor = { id: 'u1', role: 'USER' };
const input = {
  teamId: 't1',
  userIds: ['u1'],
  type: 'SALES' as const,
  period: 'MONTHLY' as const,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  name: 'Vendas',
  target: 100,
};
describe('MetricsUseCases', () => {
  let repo: jest.Mocked<MetricsRepository>;
  let service: MetricsUseCases;
  beforeEach(() => {
    repo = {
      teams: jest.fn().mockResolvedValue([team]),
      goals: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((x: unknown) => Promise.resolve(x)),
      events: jest.fn().mockResolvedValue([]),
    };
    service = new MetricsUseCases(repo);
  });
  it('saves a validated goal with creator attribution', async () => {
    expect(await service.create(actor, input)).toMatchObject({
      createdBy: 'u1',
      teamId: 't1',
    });
  });
  it('rejects a missing/inaccessible team', async () => {
    await expect(
      service.create(actor, { ...input, teamId: 'other' }),
    ).rejects.toThrow('Time não encontrado');
  });
  it('rejects members outside the selected team', async () => {
    await expect(
      service.create(actor, { ...input, userIds: ['other'] }),
    ).rejects.toThrow('Pessoas');
  });
  it('rejects reversed dates', async () => {
    await expect(
      service.create(actor, { ...input, endDate: '2025-01-01' }),
    ).rejects.toThrow('Período');
  });
  it('returns empty real series with zero totals', async () => {
    const result = await service.analysis(actor, input);
    expect(result.summary.value).toBe(0);
    expect(result.series).toHaveLength(12);
  });
  it('aggregates revenue and canceled distribution separately', async () => {
    repo.events.mockResolvedValue([
      {
        date: '2026-01-15',
        value: 250,
        kind: 'order',
        clientId: 'c1',
        phase: 'ENTREGUE',
      },
      {
        date: '2026-01-16',
        value: 500,
        kind: 'order',
        clientId: 'c2',
        phase: 'CANCELLED',
      },
    ]);
    const result = await service.analysis(actor, input);
    expect(result.summary.value).toBe(250);
    expect(result.summary.quantity).toBe(1);
    expect(
      result.distribution.find((x) => x.label === 'Cancelados')?.value,
    ).toBe(1);
  });
  it.each(['DAILY', 'WEEKLY', 'YEARLY'] as const)(
    'groups calendar periods %s',
    async (period) => {
      const result = await service.analysis(actor, {
        ...input,
        period,
        userIds: undefined,
        startDate: '2026-01-05',
        endDate: '2026-01-06',
      });
      expect(result.series.length).toBeGreaterThan(0);
    },
  );
  it.each(['ACTIVITIES', 'VISITS', 'PROSPECTING', 'RETURN'] as const)(
    'counts selected metric %s',
    async (type) => {
      repo.events.mockResolvedValue([
        { date: '2026-01-05', value: 1, kind: 'activity' },
        { date: '2026-01-05', value: 1, kind: 'visit', clientId: 'c1' },
        { date: '2026-01-05', value: 1, kind: 'prospect', clientId: 'c1' },
        {
          date: '2026-01-05',
          value: 10,
          kind: 'order',
          phase: 'PENDING',
          returning: true,
          clientId: 'c1',
        },
        {
          date: '2026-01-05',
          value: 10,
          kind: 'order',
          phase: 'ABERTO',
          returning: false,
          clientId: 'c2',
        },
      ]);
      expect(
        (await service.analysis(actor, { ...input, type })).summary.value,
      ).toBe(1);
    },
  );
  it('rejects empty names, invalid targets, missing members and huge periods', async () => {
    await expect(
      service.create(actor, { ...input, name: ' ' }),
    ).rejects.toThrow();
    await expect(
      service.create(actor, { ...input, target: 0 }),
    ).rejects.toThrow();
    await expect(
      service.create(actor, { ...input, userIds: [] }),
    ).rejects.toThrow();
    await expect(
      service.create(actor, { ...input, endDate: '2035-01-01' }),
    ).rejects.toThrow();
    await expect(
      service.create(actor, { ...input, startDate: 'invalid' }),
    ).rejects.toThrow();
    await expect(
      service.create(actor, { ...input, userIds: ['u1', 'u1'] }),
    ).rejects.toThrow();
  });
  it('counts each returning client once per period and once in summary', async () => {
    repo.events.mockResolvedValue(
      ['2026-01-03', '2026-01-04', '2026-02-03'].map((date) => ({
        date,
        value: 10,
        kind: 'order',
        clientId: 'c1',
        phase: 'ENTREGUE',
        returning: true,
      })),
    );
    const result = await service.analysis(actor, { ...input, type: 'RETURN' });
    expect(result.summary.value).toBe(1);
    expect(result.summary.quantity).toBe(1);
    expect(result.series[0].value).toBe(1);
    expect(result.series[1].value).toBe(1);
  });
});
