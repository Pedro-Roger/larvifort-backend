import { AutomationOutboxWorker } from './automation-outbox.worker';
import type { AutomationOutboxPort } from './ports/automation-outbox.port';
import type { AutomationEngineService } from './automation-engine.service';

const message = {
  id: 'outbox-1',
  eventId: 'event-1',
  eventType: 'TASK_CREATED' as const,
  projetoId: 'project-1',
  aggregateId: 'task-1',
  payload: {},
  depth: 0,
  causationChain: [],
  attempts: 0,
  availableAt: new Date(),
};

describe('AutomationOutboxWorker', () => {
  it('marks successful events processed', async () => {
    const claimPending = jest.fn().mockResolvedValue([message]);
    const markProcessed = jest.fn();
    const markRetry = jest.fn();
    const markDead = jest.fn();
    const outbox = {
      claimPending,
      markProcessed,
      markRetry,
      markDead,
    } as unknown as AutomationOutboxPort;
    const engine = { process: jest.fn() } as unknown as AutomationEngineService;
    const worker = new AutomationOutboxWorker(outbox, engine);

    await worker.runOnce();

    expect(markProcessed).toHaveBeenCalledWith('outbox-1');
  });

  it('uses bounded exponential backoff then dead-letters', async () => {
    const claimPending = jest
      .fn()
      .mockResolvedValueOnce([{ ...message, attempts: 1 }])
      .mockResolvedValueOnce([{ ...message, attempts: 4 }]);
    const markProcessed = jest.fn();
    const markRetry = jest.fn();
    const markDead = jest.fn();
    const outbox = {
      claimPending,
      markProcessed,
      markRetry,
      markDead,
    } as unknown as AutomationOutboxPort;
    const engine = {
      process: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as AutomationEngineService;
    const worker = new AutomationOutboxWorker(outbox, engine);

    await worker.runOnce();
    await worker.runOnce();

    expect(markRetry).toHaveBeenCalledWith(
      'outbox-1',
      expect.any(Date),
      'boom',
    );
    expect(markDead).toHaveBeenCalledWith('outbox-1', 'boom');
  });
});
