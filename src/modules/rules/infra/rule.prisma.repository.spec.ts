import { PrismaRuleRepository } from './rule.prisma.repository';
import type { Rule } from '../domain/rule';

describe('PrismaRuleRepository', () => {
  const baseDate = new Date('2026-09-10T10:00:00Z');

  const sampleRow: Rule = {
    id: 'rule-1',
    name: 'Impedir movimento para Concluído',
    description: null,
    scope: 'COLUMN',
    scopeId: null,
    projectId: 'p-1',
    columnId: 'c-1',
    action: 'DENY_MOVE',
    conditions: {},
    parameters: {},
    priority: 10,
    active: true,
    createdAt: baseDate,
    updatedAt: baseDate,
  };

  function makePrismaMock() {
    return {
      rule: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
  }

  it('findMany lista com filtros e paginação', async () => {
    const prisma = makePrismaMock();
    prisma.rule.findMany.mockResolvedValue([sampleRow]);
    prisma.rule.count.mockResolvedValue(1);
    const sut = new PrismaRuleRepository(prisma);

    const result = await sut.findMany({
      scope: 'COLUMN',
      scopeId: 'c-1',
      projectId: 'p-1',
      columnId: 'c-1',
      active: true,
      page: 2,
      limit: 10,
    });

    expect(result).toEqual({ data: [sampleRow], total: 1 });
    expect(prisma.rule.findMany).toHaveBeenCalledWith({
      where: {
        scope: 'COLUMN',
        scopeId: 'c-1',
        projectId: 'p-1',
        columnId: 'c-1',
        active: true,
      },
      skip: 10,
      take: 10,
      orderBy: { priority: 'desc' },
    });
    expect(prisma.rule.count).toHaveBeenCalledWith({
      where: {
        scope: 'COLUMN',
        scopeId: 'c-1',
        projectId: 'p-1',
        columnId: 'c-1',
        active: true,
      },
    });
  });

  it('findMany normaliza página/limite e omite filtros indefinidos', async () => {
    const prisma = makePrismaMock();
    prisma.rule.findMany.mockResolvedValue([]);
    prisma.rule.count.mockResolvedValue(0);
    const sut = new PrismaRuleRepository(prisma);

    await sut.findMany({ page: 0, limit: 500 });

    expect(prisma.rule.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 100,
      orderBy: { priority: 'desc' },
    });
  });

  it('findById devolve regra encontrada', async () => {
    const prisma = makePrismaMock();
    prisma.rule.findUnique.mockResolvedValue(sampleRow);
    const sut = new PrismaRuleRepository(prisma);

    const result = await sut.findById('rule-1');
    expect(result).toEqual(sampleRow);
    expect(prisma.rule.findUnique).toHaveBeenCalledWith({
      where: { id: 'rule-1' },
    });
  });

  it('findById devolve null quando regra não existe', async () => {
    const prisma = makePrismaMock();
    prisma.rule.findUnique.mockResolvedValue(null);
    const sut = new PrismaRuleRepository(prisma);

    const result = await sut.findById('rule-ghost');
    expect(result).toBeNull();
  });

  it('findApplicableRules busca regras ativas por prioridade', async () => {
    const prisma = makePrismaMock();
    prisma.rule.findMany.mockResolvedValue([sampleRow]);
    const sut = new PrismaRuleRepository(prisma);

    const result = await sut.findApplicableRules({
      userId: 'u-1',
      userRole: 'USER',
      teamId: null,
      projectId: 'p-1',
      columnId: 'c-1',
    });

    expect(result).toEqual([sampleRow]);
    expect(prisma.rule.findMany).toHaveBeenCalledWith({
      where: { active: true },
      orderBy: { priority: 'desc' },
    });
  });

  it('create persiste regra com defaults', async () => {
    const prisma = makePrismaMock();
    prisma.rule.create.mockResolvedValue(sampleRow);
    const sut = new PrismaRuleRepository(prisma);

    const result = await sut.create({
      name: 'Regra',
      scope: 'USER',
      action: 'REQUIRE_FIELD',
      conditions: {},
      parameters: { fields: ['x'] },
    });

    expect(result).toEqual(sampleRow);
    expect(prisma.rule.create).toHaveBeenCalledWith({
      data: {
        name: 'Regra',
        description: null,
        scope: 'USER',
        scopeId: null,
        projectId: null,
        columnId: null,
        action: 'REQUIRE_FIELD',
        conditions: {},
        parameters: { fields: ['x'] },
        priority: 0,
        active: true,
      },
    });
  });

  it('update persiste apenas campos informados', async () => {
    const prisma = makePrismaMock();
    prisma.rule.update.mockResolvedValue({ ...sampleRow, name: 'Novo' });
    const sut = new PrismaRuleRepository(prisma);

    const result = await sut.update('rule-1', {
      name: 'Novo',
      active: false,
    });

    expect(result.name).toBe('Novo');
    expect(prisma.rule.update).toHaveBeenCalledWith({
      where: { id: 'rule-1' },
      data: { name: 'Novo', active: false },
    });
  });

  it('delete remove regra por id', async () => {
    const prisma = makePrismaMock();
    prisma.rule.delete.mockResolvedValue(sampleRow);
    const sut = new PrismaRuleRepository(prisma);

    await sut.delete('rule-1');
    expect(prisma.rule.delete).toHaveBeenCalledWith({
      where: { id: 'rule-1' },
    });
  });
});
