import { MetricsPrismaRepository } from './metrics.prisma.repository';
import { PrismaService } from '../../../core/database/prisma.service';
const actor = { id: 'u1', role: 'USER' };
describe('MetricsPrismaRepository', () => {
  const db = {
    user: { findUnique: jest.fn() },
    team: { findMany: jest.fn() },
    metricGoal: { findMany: jest.fn(), create: jest.fn() },
    $queryRaw: jest.fn(),
    appointment: { findMany: jest.fn() },
    task: { findMany: jest.fn() },
    cliente: { findMany: jest.fn() },
  };
  const repo = new MetricsPrismaRepository(db as unknown as PrismaService);
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('hides all teams for inactive and missing users', async () => {
    db.user.findUnique.mockResolvedValue(null);
    expect(await repo.teams(actor)).toEqual([]);
    db.user.findUnique.mockResolvedValue({ active: false });
    expect(await repo.teams(actor)).toEqual([]);
  });
  it('reads role from database and scopes members to their own team', async () => {
    db.user.findUnique.mockResolvedValue({
      active: true,
      role: 'USER',
      teamId: 't1',
    });
    db.team.findMany.mockResolvedValue([
      {
        id: 't1',
        name: 'Sales',
        members: [{ id: 'u1', firstName: 'Ana', lastName: 'Silva' }],
      },
    ]);
    expect(await repo.teams(actor)).toEqual([
      { id: 't1', name: 'Sales', members: [{ id: 'u1', name: 'Ana Silva' }] },
    ]);
    expect(db.team.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: 't1' },
      }),
    );
  });
  it('allows admins and safely handles users without team', async () => {
    db.user.findUnique.mockResolvedValue({ active: true, role: 'ADMIN' });
    db.team.findMany.mockResolvedValue([]);
    await repo.teams(actor);
    expect(db.team.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: {} }),
    );
    db.user.findUnique.mockResolvedValue({ active: true, role: 'USER' });
    await repo.teams(actor);
    expect(db.team.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: '' },
      }),
    );
  });
  it('maps scoped orders, visits, tasks and prospects without canceled return history', async () => {
    db.$queryRaw.mockResolvedValue([
      {
        orderDate: new Date('2025-12-01'),
        clientId: 'c1',
        phase: 'CANCELLED',
        totalAmount: 10,
      },
      {
        orderDate: new Date('2026-01-05'),
        clientId: 'c1',
        phase: 'ENTREGUE',
        totalAmount: 20,
      },
      {
        orderDate: new Date('2026-01-06'),
        clientId: 'c1',
        phase: 'ENTREGUE',
        totalAmount: 30,
      },
    ]);
    db.appointment.findMany.mockResolvedValue([
      { data: new Date('2026-01-05'), clienteId: null },
    ]);
    db.task.findMany.mockResolvedValue([
      { updatedAt: new Date('2026-01-05'), clienteId: 'c1' },
    ]);
    db.cliente.findMany.mockResolvedValue([
      { createdAt: new Date('2026-01-05'), id: 'c2' },
    ]);
    const result = await repo.events({
      teamId: 't1',
      userIds: ['u1'],
      type: 'SALES',
      period: 'MONTHLY',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
    expect(result).toHaveLength(5);
    expect(result[0].returning).toBe(false);
    expect(result[1].returning).toBe(true);
    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
    const [strings, endDate, firstUserIds, secondUserIds] = db.$queryRaw.mock.calls[0];
    expect(strings.join('')).toContain("status::text = 'PEDIDO'");
    expect(endDate).toEqual(new Date('2026-01-31T23:59:59.999Z'));
    expect(firstUserIds.values).toEqual(['u1']);
    expect(secondUserIds.values).toEqual(['u1']);
  });

  it('returns no events without scoped members before querying metrics sources', async () => {
    await expect(
      repo.events({
        teamId: 't1',
        userIds: [],
        type: 'SALES',
        period: 'MONTHLY',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }),
    ).resolves.toEqual([]);
    expect(db.$queryRaw).not.toHaveBeenCalled();
    expect(db.appointment.findMany).not.toHaveBeenCalled();
  });

  it('persists and retrieves goals', async () => {
    db.metricGoal.findMany.mockResolvedValue([]);
    expect(await repo.goals(['t1'])).toEqual([]);
    const input = {
      teamId: 't1',
      userIds: ['u1'],
      name: 'A',
      target: 1,
      type: 'SALES' as const,
      period: 'MONTHLY' as const,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      createdBy: 'u1',
    };
    db.metricGoal.create.mockResolvedValue(input);
    expect(await repo.create(input)).toEqual(input);
  });
});
