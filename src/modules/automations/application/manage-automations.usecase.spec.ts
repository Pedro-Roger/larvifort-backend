import { NotFoundException } from '@nestjs/common';
import { ManageAutomationsUseCase } from './manage-automations.usecase';
import type { AutomationRepositoryPort } from './ports/automation-repository.port';

const repository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  reorder: jest.fn(),
  findHistory: jest.fn(),
} as unknown as AutomationRepositoryPort;

describe('ManageAutomationsUseCase', () => {
  beforeEach(() => jest.clearAllMocks());

  it('toggles and reorders persisted automations', async () => {
    const findById = jest.fn().mockResolvedValue({ id: 'a1', isActive: true });
    const update = jest.fn().mockResolvedValue({ id: 'a1', isActive: false });
    const reorder = jest.fn().mockResolvedValue(undefined);
    const repository = {
      findById,
      create: jest.fn(),
      update,
      softDelete: jest.fn(),
      reorder,
      findHistory: jest.fn(),
    } as unknown as AutomationRepositoryPort;
    const usecase = new ManageAutomationsUseCase(repository);

    await expect(usecase.toggle('a1')).resolves.toEqual(
      expect.objectContaining({ isActive: false }),
    );
    await usecase.reorder('p1', ['a2', 'a1']);

    expect(reorder).toHaveBeenCalledWith('p1', ['a2', 'a1']);
  });

  it('rejects operations for missing automations', async () => {
    repository.findById = jest.fn().mockResolvedValue(null);
    const usecase = new ManageAutomationsUseCase(repository);

    await expect(usecase.toggle('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
