import { AutomationsController } from './automations.controller';
import type { ManageAutomationsUseCase } from '../application/manage-automations.usecase';
import type { AutomationEngineService } from '../application/automation-engine.service';
import type { Automation, AutomationExecution } from '../domain/automation';
import type { CreateAutomationDto } from './dto/automation.dto';

describe('AutomationsController', () => {
  const SAMPLE_AUTOMATION: Automation = {
    id: 'automation-1',
    projetoId: 'project-1',
    name: 'Mover urgente',
    description: null,
    trigger: 'TASK_CREATED',
    conditions: [{ field: 'prioridade', operator: 'EQUALS', value: 'ALTA' }],
    conditionMode: 'AND',
    actions: [
      { type: 'ADD_TAG', params: { tag: 'automatica' } },
      { type: 'MOVE_TASK', params: { columnId: 'column-2' } },
    ],
    schedule: null,
    isActive: true,
    priority: 0,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const SAMPLE_EXECUTION: AutomationExecution = {
    id: 'exec-1',
    automationId: 'automation-1',
    eventId: 'event-1',
    attempt: 1,
    durationMs: 100,
    result: 'SUCCESS',
    error: null,
    createdAt: new Date(),
    completedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const removeExecute = jest.fn();
    const reorderExecute = jest.fn();
    const toggleExecute = jest.fn();
    const historyExecute = jest.fn();
    const dryRunExecute = jest.fn();

    const manage = {
      list: listExecute,
      get: getExecute,
      create: createExecute,
      update: updateExecute,
      remove: removeExecute,
      reorder: reorderExecute,
      toggle: toggleExecute,
      history: historyExecute,
    } as unknown as ManageAutomationsUseCase;

    const engine = {
      dryRun: dryRunExecute,
    } as unknown as AutomationEngineService;

    const sut = new AutomationsController(manage, engine);

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      removeExecute,
      reorderExecute,
      toggleExecute,
      historyExecute,
      dryRunExecute,
    };
  }

  it('list delega para ManageAutomationsUseCase', async () => {
    const { sut, listExecute } = makeSut();
    listExecute.mockResolvedValue([SAMPLE_AUTOMATION]);

    const result = await sut.list('project-1');

    expect(listExecute).toHaveBeenCalledWith('project-1');
    expect(result).toEqual([SAMPLE_AUTOMATION]);
  });

  it('get delega para ManageAutomationsUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_AUTOMATION);

    const result = await sut.get('automation-1');

    expect(getExecute).toHaveBeenCalledWith('automation-1');
    expect(result).toEqual(SAMPLE_AUTOMATION);
  });

  it('create delega para ManageAutomationsUseCase com projetoId e createdBy', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_AUTOMATION);

    const dto: CreateAutomationDto = {
      name: 'Mover urgente',
      trigger: 'TASK_CREATED',
      conditions: [{ field: 'prioridade', operator: 'EQUALS', value: 'ALTA' }],
      conditionMode: 'AND',
      actions: [{ type: 'MOVE_TASK', params: { columnId: 'column-2' } }],
      isActive: true,
    };
    const result = await sut.create('project-1', 'user-1', dto);

    expect(createExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        projetoId: 'project-1',
        createdBy: 'user-1',
      }),
    );
    expect(result).toEqual(SAMPLE_AUTOMATION);
  });

  it('update delega para ManageAutomationsUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({
      ...SAMPLE_AUTOMATION,
      name: 'Atualizada',
    });

    const result = await sut.update('automation-1', { name: 'Atualizada' });

    expect(updateExecute).toHaveBeenCalledWith('automation-1', {
      name: 'Atualizada',
    });
    expect(result.name).toBe('Atualizada');
  });

  it('toggle delega para ManageAutomationsUseCase', async () => {
    const { sut, toggleExecute } = makeSut();
    toggleExecute.mockResolvedValue({ ...SAMPLE_AUTOMATION, isActive: false });

    const result = await sut.toggle('automation-1');

    expect(toggleExecute).toHaveBeenCalledWith('automation-1');
    expect(result.isActive).toBe(false);
  });

  it('reorder delega para ManageAutomationsUseCase', async () => {
    const { sut, reorderExecute } = makeSut();
    reorderExecute.mockResolvedValue(undefined);

    await sut.reorder('project-1', { ids: ['a2', 'a1'] });

    expect(reorderExecute).toHaveBeenCalledWith('project-1', ['a2', 'a1']);
  });

  it('remove delega para ManageAutomationsUseCase', async () => {
    const { sut, removeExecute } = makeSut();
    removeExecute.mockResolvedValue(undefined);

    await sut.remove('automation-1');

    expect(removeExecute).toHaveBeenCalledWith('automation-1');
  });

  it('history delega para ManageAutomationsUseCase', async () => {
    const { sut, historyExecute } = makeSut();
    historyExecute.mockResolvedValue([SAMPLE_EXECUTION]);

    const result = await sut.history('project-1', { limit: 10 });

    expect(historyExecute).toHaveBeenCalledWith('project-1', 10);
    expect(result).toEqual([SAMPLE_EXECUTION]);
  });

  it('dryRun delega para AutomationEngineService', async () => {
    const { sut, dryRunExecute, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_AUTOMATION);
    dryRunExecute.mockResolvedValue({
      matched: true,
      actions: SAMPLE_AUTOMATION.actions,
    });

    const result = await sut.dryRun('automation-1', {
      payload: { prioridade: 'ALTA' },
    });

    expect(getExecute).toHaveBeenCalledWith('automation-1');
    expect(dryRunExecute).toHaveBeenCalledWith(SAMPLE_AUTOMATION, {
      prioridade: 'ALTA',
    });
    expect(result).toEqual({
      matched: true,
      actions: SAMPLE_AUTOMATION.actions,
    });
  });
});
