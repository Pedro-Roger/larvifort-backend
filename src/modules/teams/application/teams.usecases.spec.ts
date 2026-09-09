import {
  ListTeamsUseCase,
  GetTeamByIdUseCase,
  CreateTeamUseCase,
  UpdateTeamUseCase,
  DeleteTeamUseCase,
} from './teams.usecases';
import type { TeamRepositoryPort } from './ports/team-repository.port';
import type { Team } from '../domain/team';

describe('Teams Use Cases', () => {
  const mockTeam: Team = {
    id: 'team-1',
    name: 'Comercial',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
  };

  it('ListTeamsUseCase lista os times', async () => {
    const findMany = jest.fn().mockResolvedValue([mockTeam]);
    const repo = { findMany } as unknown as TeamRepositoryPort;
    const sut = new ListTeamsUseCase(repo);

    const result = await sut.execute();
    expect(result).toEqual([mockTeam]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('GetTeamByIdUseCase busca time por id', async () => {
    const findById = jest.fn().mockResolvedValue(mockTeam);
    const repo = { findById } as unknown as TeamRepositoryPort;
    const sut = new GetTeamByIdUseCase(repo);

    const result = await sut.execute('team-1');
    expect(result).toEqual(mockTeam);
    expect(findById).toHaveBeenCalledWith('team-1');
  });

  it('CreateTeamUseCase cria time', async () => {
    const create = jest.fn().mockResolvedValue(mockTeam);
    const repo = { create } as unknown as TeamRepositoryPort;
    const sut = new CreateTeamUseCase(repo);

    const result = await sut.execute('Comercial');
    expect(result).toEqual(mockTeam);
    expect(create).toHaveBeenCalledWith('Comercial');
  });

  it('UpdateTeamUseCase atualiza time', async () => {
    const update = jest
      .fn()
      .mockResolvedValue({ ...mockTeam, name: 'Técnico' });
    const repo = { update } as unknown as TeamRepositoryPort;
    const sut = new UpdateTeamUseCase(repo);

    const result = await sut.execute('team-1', 'Técnico');
    expect(result.name).toBe('Técnico');
    expect(update).toHaveBeenCalledWith('team-1', 'Técnico');
  });

  it('DeleteTeamUseCase deleta time', async () => {
    const del = jest.fn().mockResolvedValue(undefined);
    const repo = { delete: del } as unknown as TeamRepositoryPort;
    const sut = new DeleteTeamUseCase(repo);

    await sut.execute('team-1');
    expect(del).toHaveBeenCalledWith('team-1');
  });
});
