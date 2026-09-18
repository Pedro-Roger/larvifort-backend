import { SeparationController } from './separation.controller';

describe('SeparationController contract', () => {
  it('lists separation orders while preserving the existing actions', async () => {
    const repository = {
      findMany: jest.fn().mockResolvedValue([{ id: 'separation-1' }]),
    };
    const controller = new SeparationController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      repository,
    );

    await expect(controller.list()).resolves.toEqual([{ id: 'separation-1' }]);
    expect(repository.findMany).toHaveBeenCalled();
  });
});
