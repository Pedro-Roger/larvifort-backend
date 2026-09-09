import { PrismaService } from '../../../core/database/prisma.service';
import { PrismaTeamRepository } from './team.prisma.repository';

describe('PrismaTeamRepository', () => {
  let sut: PrismaTeamRepository;
  let mockPrisma: {
    team: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const sampleTeam = {
    id: 'team-1',
    name: 'Comercial',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  beforeEach(() => {
    mockPrisma = {
      team: {
        findMany: jest.fn().mockResolvedValue([sampleTeam]),
        findUnique: jest.fn().mockResolvedValue(sampleTeam),
        create: jest.fn().mockResolvedValue(sampleTeam),
        update: jest.fn().mockResolvedValue(sampleTeam),
        delete: jest.fn().mockResolvedValue(sampleTeam),
      },
    };
    sut = new PrismaTeamRepository(mockPrisma as unknown as PrismaService);
  });

  it('deve listar times ordenados por nome', async () => {
    const result = await sut.findMany();
    expect(result).toEqual([sampleTeam]);
    expect(mockPrisma.team.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('deve buscar time por id', async () => {
    const result = await sut.findById('team-1');
    expect(result).toEqual(sampleTeam);
    expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
      where: { id: 'team-1' },
    });
  });

  it('deve retornar null se time não for encontrado por id', async () => {
    mockPrisma.team.findUnique.mockResolvedValue(null);
    const result = await sut.findById('team-ghost');
    expect(result).toBeNull();
  });

  it('deve buscar time por nome', async () => {
    const result = await sut.findByName('Comercial');
    expect(result).toEqual(sampleTeam);
    expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
      where: { name: 'Comercial' },
    });
  });

  it('deve criar um novo time', async () => {
    const result = await sut.create('Comercial');
    expect(result).toEqual(sampleTeam);
    expect(mockPrisma.team.create).toHaveBeenCalledWith({
      data: { name: 'Comercial' },
    });
  });

  it('deve atualizar um time', async () => {
    const result = await sut.update('team-1', 'Novo Nome');
    expect(result).toEqual(sampleTeam);
    expect(mockPrisma.team.update).toHaveBeenCalledWith({
      where: { id: 'team-1' },
      data: { name: 'Novo Nome' },
    });
  });

  it('deve deletar um time', async () => {
    await sut.delete('team-1');
    expect(mockPrisma.team.delete).toHaveBeenCalledWith({
      where: { id: 'team-1' },
    });
  });
});
