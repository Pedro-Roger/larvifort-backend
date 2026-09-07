import { BadRequestException } from '@nestjs/common';
import { UpdateMeUseCase } from './update-me.usecase';
import type { UserRepositoryPort } from './ports/user-repository.port';
import type { User } from '../domain/user';

describe('UpdateMeUseCase', () => {
  const SAMPLE_USER: User = {
    id: 'u-1',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana@lavifort.com.br',
    role: 'USER',
    active: true,
    teamId: 't-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  it('atualiza firstName do próprio usuário', async () => {
    const updateMock = jest.fn().mockResolvedValue({
      ...SAMPLE_USER,
      firstName: 'Maria',
    });
    const repo: UserRepositoryPort = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: updateMock,
      delete: jest.fn(),
    };
    const uc = new UpdateMeUseCase(repo);
    const result = await uc.execute('u-1', { firstName: 'Maria' });
    expect(result.firstName).toBe('Maria');
    expect(updateMock).toHaveBeenCalledWith('u-1', { firstName: 'Maria' });
  });

  it('atualiza email do próprio usuário', async () => {
    const updateMock = jest.fn().mockResolvedValue({
      ...SAMPLE_USER,
      email: 'novo@lavifort.com.br',
    });
    const repo: UserRepositoryPort = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: updateMock,
      delete: jest.fn(),
    };
    const uc = new UpdateMeUseCase(repo);
    await uc.execute('u-1', { email: 'novo@lavifort.com.br' });
    expect(updateMock).toHaveBeenCalledWith('u-1', {
      email: 'novo@lavifort.com.br',
    });
  });

  it('lança BadRequestException quando userId vazio', async () => {
    const repo: UserRepositoryPort = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const uc = new UpdateMeUseCase(repo);
    await expect(uc.execute('', { firstName: 'X' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
