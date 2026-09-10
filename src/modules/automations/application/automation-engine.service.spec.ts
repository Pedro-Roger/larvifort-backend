import type { Automation, AutomationEvent } from '../domain/automation';
import type { AutomationAction } from '../domain/automation';
import { AutomationEngineService } from './automation-engine.service';
import type { AutomationRepositoryPort } from './ports/automation-repository.port';
import type { AutomationActionPort } from './ports/automation-action.port';

const automation: Automation = {
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

const event: AutomationEvent = {
  id: 'event-1',
  type: 'TASK_CREATED',
  projetoId: 'project-1',
  aggregateId: 'task-1',
  payload: { prioridade: 'ALTA' },
  depth: 0,
  causationChain: [],
  occurredAt: new Date(),
};

describe('AutomationEngineService', () => {
  it('executes matching actions in order and records success', async () => {
    const findActiveByEvent = jest.fn().mockResolvedValue([automation]);
    const hasExecution = jest.fn().mockResolvedValue(false);
    const createExecution = jest.fn().mockResolvedValue({ id: 'execution-1' });
    const completeExecution = jest.fn();
    const repository = {
      findActiveByEvent,
      hasExecution,
      createExecution,
      completeExecution,
    } as unknown as AutomationRepositoryPort;
    const execute = jest.fn().mockResolvedValue(undefined);
    const actions = { execute } as AutomationActionPort;
    const engine = new AutomationEngineService(repository, actions);

    await engine.process(event, 1);

    expect(
      (execute.mock.calls as Array<[AutomationAction, AutomationEvent]>).map(
        (call) => call[0].type,
      ),
    ).toEqual(['ADD_TAG', 'MOVE_TASK']);
    expect(completeExecution).toHaveBeenCalledWith(
      'execution-1',
      expect.objectContaining({ result: 'SUCCESS', error: null }),
    );
  });

  it('skips duplicate events and protects depth/cycles', async () => {
    const findActiveByEvent = jest.fn().mockResolvedValue([automation]);
    const hasExecution = jest.fn().mockResolvedValue(true);
    const createExecution = jest.fn();
    const completeExecution = jest.fn();
    const repository = {
      findActiveByEvent,
      hasExecution,
      createExecution,
      completeExecution,
    } as unknown as AutomationRepositoryPort;
    const execute = jest.fn();
    const actions = { execute } as AutomationActionPort;
    const engine = new AutomationEngineService(repository, actions);

    await engine.process(event, 1);
    await engine.process(
      { ...event, id: 'event-2', depth: 6, causationChain: [] },
      1,
    );
    await engine.process(
      { ...event, id: 'event-3', causationChain: ['automation-1'] },
      1,
    );

    expect(execute).not.toHaveBeenCalled();
    expect(createExecution).not.toHaveBeenCalled();
  });

  it('sanitizes errors before storing failure', async () => {
    const findActiveByEvent = jest.fn().mockResolvedValue([automation]);
    const hasExecution = jest.fn().mockResolvedValue(false);
    const createExecution = jest.fn().mockResolvedValue({ id: 'execution-1' });
    const completeExecution = jest.fn();
    const repository = {
      findActiveByEvent,
      hasExecution,
      createExecution,
      completeExecution,
    } as unknown as AutomationRepositoryPort;
    const execute = jest
      .fn()
      .mockRejectedValue(new Error('token=secret-value\nfailed'));
    const actions = { execute } as AutomationActionPort;
    const engine = new AutomationEngineService(repository, actions);

    await expect(engine.process(event, 1)).rejects.toThrow(
      'Automation action failed',
    );
    expect(completeExecution).toHaveBeenCalledWith(
      'execution-1',
      expect.objectContaining({
        result: 'FAILED',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: expect.not.stringContaining('secret-value'),
      }),
    );
  });
});
