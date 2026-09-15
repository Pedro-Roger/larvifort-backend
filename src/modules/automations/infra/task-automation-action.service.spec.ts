import { TaskAutomationActionService } from './task-automation-action.service';
import type {
  AutomationActionType,
  AutomationEvent,
} from '../domain/automation';

describe('TaskAutomationActionService', () => {
  function makePrismaMock() {
    return {
      task: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
  }

  const sampleEvent: AutomationEvent = {
    id: 'evt-1',
    type: 'TASK_CREATED',
    projetoId: 'proj-1',
    aggregateId: 'task-1',
    payload: {},
    depth: 0,
    causationChain: [],
    occurredAt: new Date('2026-09-01'),
  };

  it('ignora action NOTIFY', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute({ type: 'NOTIFY', params: {} }, sampleEvent);

    expect(prisma.task.update).not.toHaveBeenCalled();
    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it('executa CREATE_LINKED_TASK criando nova task no projeto', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      {
        type: 'CREATE_LINKED_TASK',
        params: { title: 'Follow-up', columnId: 'col-2' },
      },
      sampleEvent,
    );

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        projetoId: 'proj-1',
        titulo: 'Follow-up',
        descricao: 'Criada pela automação a partir de task-1',
        columnId: 'col-2',
        tipo: 'GERAL',
      },
    });
  });

  it('executa CREATE_APPOINTMENT_TASK criando card de compromisso idempotente', async () => {
    const prisma = makePrismaMock();
    prisma.task.findFirst.mockResolvedValue(null);
    const service = new TaskAutomationActionService(prisma);

    const appointmentEvent: AutomationEvent = {
      id: 'evt-app-1',
      type: 'APPOINTMENT_CREATED',
      projetoId: 'proj-1',
      aggregateId: 'app-1',
      payload: {
        appointmentId: 'app-1',
        clienteId: 'client-1',
        titulo: 'Visita Técnica Fazenda',
        tipo: 'VISITA',
        data: '2026-10-15T14:00:00.000Z',
        horario: '14:00',
        endereco: 'Rodovia CE-040 km 30',
        observacoes: 'Levar amostras',
      },
      depth: 0,
      causationChain: [],
      occurredAt: new Date('2026-10-01'),
    };

    await service.execute(
      {
        type: 'CREATE_APPOINTMENT_TASK',
        params: { targetColumnId: 'col-agenda' },
      },
      appointmentEvent,
    );

    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        appointmentId: 'app-1',
        projetoId: 'proj-1',
      },
    });

    const createMock = prisma.task.create;
    const createCall = createMock.mock.calls[0] as Array<{
      data: {
        projetoId: string;
        columnId: string;
        titulo: string;
        tipo: string;
        appointmentId: string;
        clienteId: string;
        status: string;
      };
    }>;
    expect(createCall[0].data.projetoId).toBe('proj-1');
    expect(createCall[0].data.columnId).toBe('col-agenda');
    expect(createCall[0].data.titulo).toBe('Visita Técnica Fazenda');
    expect(createCall[0].data.tipo).toBe('COMPROMISSO');
    expect(createCall[0].data.appointmentId).toBe('app-1');
    expect(createCall[0].data.clienteId).toBe('client-1');
    expect(createCall[0].data.status).toBe('BACKLOG');
  });

  it('CREATE_APPOINTMENT_TASK não duplica card se já existir no projeto', async () => {
    const prisma = makePrismaMock();
    prisma.task.findFirst.mockResolvedValue({ id: 'existing-task-1' });
    const service = new TaskAutomationActionService(prisma);

    const appointmentEvent: AutomationEvent = {
      id: 'evt-app-1',
      type: 'APPOINTMENT_CREATED',
      projetoId: 'proj-1',
      aggregateId: 'app-1',
      payload: {
        appointmentId: 'app-1',
        clienteId: 'client-1',
        titulo: 'Visita',
      },
      depth: 0,
      causationChain: [],
      occurredAt: new Date('2026-10-01'),
    };

    await service.execute(
      {
        type: 'CREATE_APPOINTMENT_TASK',
        params: { targetColumnId: 'col-agenda' },
      },
      appointmentEvent,
    );

    expect(prisma.task.findFirst).toHaveBeenCalled();
    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it('executa MOVE_TASK atualizando columnId', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      { type: 'MOVE_TASK', params: { columnId: 'col-done' } },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { columnId: 'col-done' },
    });
  });

  it('executa ASSIGN_TASK atualizando assigneeId', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      { type: 'ASSIGN_TASK', params: { userId: 'user-2' } },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { assigneeId: 'user-2' },
    });
  });

  it('executa SET_PRIORITY atualizando prioridade', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      { type: 'SET_PRIORITY', params: { priority: 'ALTA' } },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { prioridade: 'ALTA' },
    });
  });

  it('executa ADD_TAG adicionando tag via push', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      { type: 'ADD_TAG', params: { tag: 'URGENTE' } },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { tags: { push: 'URGENTE' } },
    });
  });

  it('executa REMOVE_TAG atualizando tags sem o item', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      { type: 'REMOVE_TAG', params: { tagsWithoutRemoved: ['BUG'] } },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { tags: ['BUG'] },
    });
  });

  it('executa SET_DUE_DATE atualizando prazo', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      { type: 'SET_DUE_DATE', params: { dueDate: '2026-12-31T23:59:59.000Z' } },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { prazo: new Date('2026-12-31T23:59:59.000Z') },
    });
  });

  it('executa ação desconhecida passando data vazio', async () => {
    const prisma = makePrismaMock();
    const service = new TaskAutomationActionService(prisma);

    await service.execute(
      {
        type: 'UNKNOWN_ACTION' as unknown as AutomationActionType,
        params: {},
      },
      sampleEvent,
    );

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: {},
    });
  });
});
