import { DirectAutomationsController } from './direct-automations.controller';
import type { ManageAutomationsUseCase } from '../application/manage-automations.usecase';
import type { AutomationEngineService } from '../application/automation-engine.service';
import type { Automation } from '../domain/automation';

describe('DirectAutomationsController', () => {
  const SAMPLE_AUTOMATION: Automation = {
    id: 'auto-1',
    projetoId: 'board-1',
    name: 'Auto Move',
    description: null,
    trigger: 'TASK_CREATED',
    conditions: [],
    conditionMode: 'AND',
    actions: [{ type: 'MOVE_TASK', params: { targetColumnId: 'col-2' } }],
    schedule: null,
    isActive: true,
    priority: 1,
    createdBy: 'u-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  function makeSut() {
    const manageMock = {
      update: jest.fn(),
      remove: jest.fn(),
      get: jest.fn(),
    };
    const engineMock = {
      dryRun: jest.fn(),
    };

    const sut = new DirectAutomationsController(
      manageMock as unknown as ManageAutomationsUseCase,
      engineMock as unknown as AutomationEngineService,
    );

    return { sut, manageMock, engineMock };
  }

  it('update atualiza automação por id', async () => {
    const { sut, manageMock } = makeSut();
    manageMock.update.mockResolvedValue({
      ...SAMPLE_AUTOMATION,
      name: 'Novo Nome',
    });

    const result = await sut.update('auto-1', { name: 'Novo Nome' });
    expect(manageMock.update).toHaveBeenCalledWith('auto-1', {
      name: 'Novo Nome',
    });
    expect(result.name).toBe('Novo Nome');
  });

  it('remove exclui automação por id', async () => {
    const { sut, manageMock } = makeSut();
    manageMock.remove.mockResolvedValue(undefined);

    await sut.remove('auto-1');
    expect(manageMock.remove).toHaveBeenCalledWith('auto-1');
  });

  it('testAutomation executa dryRun', async () => {
    const { sut, manageMock, engineMock } = makeSut();
    manageMock.get.mockResolvedValue(SAMPLE_AUTOMATION);
    engineMock.dryRun.mockReturnValue({
      matched: true,
      actions: SAMPLE_AUTOMATION.actions,
    });

    const result = await sut.testAutomation('auto-1', { status: 'NOVO' });
    expect(engineMock.dryRun).toHaveBeenCalledWith(SAMPLE_AUTOMATION, {
      status: 'NOVO',
    });
    expect(result.success).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);
  });
});
