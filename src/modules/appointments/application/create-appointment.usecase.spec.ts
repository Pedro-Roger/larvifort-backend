import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';
import type { ClientRepositoryPort } from '../../clients/application/ports/client-repository.port';
import type { AutomationOutboxPort } from '../../automations/application/ports/automation-outbox.port';
import type { AutomationRepositoryPort } from '../../automations/application/ports/automation-repository.port';
import type { Appointment } from '../domain/appointment';
import type { Client } from '../../clients/domain/client';
import type { Automation } from '../../automations/domain/automation';
import type { CreateTaskUseCase } from '../../tasks/application/create-task.usecase';

describe('CreateAppointmentUseCase', () => {
  const SAMPLE_CLIENT: Client = {
    id: 'c-1',
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@fazenda.com',
    phone: null,
    birthdate: null,
    cpfCnpj: null,
    statusLead: 'CLIENTE_ATIVO',
    origem: null,
    pais: 'Brasil',
    cidade: 'Aracati',
    uf: 'CE',
    endereco: 'Fazenda Boa Esperança, km 10',
    observacoes: null,
    empresaId: 'e-1',
    laminaAgua: null,
    qtdViveiros: null,
    densidade: null,
    producaoMedia: null,
    temBercario: false,
    qtdBercarios: null,
    volumeBercarios: null,
    alimentadorAutomatico: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE: Appointment = {
    id: 'a-1',
    tipo: 'VISITA',
    titulo: 'Visita ao cliente',
    data: new Date('2026-10-01T10:00:00'),
    horario: '10:00',
    endereco: 'Fazenda Boa Esperança, km 10, Aracati, CE',
    observacoes: null,
    clienteId: 'c-1',
    empresaId: 'e-1',
    ownerId: 'u-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  function makeSut(mocks?: {
    findClientById?: jest.Mock;
    createAppointment?: jest.Mock;
    publishOutbox?: jest.Mock;
    findActiveAutomations?: jest.Mock;
    createTask?: jest.Mock;
  }) {
    const createAppointmentMock: jest.Mock =
      mocks?.createAppointment ?? jest.fn().mockResolvedValue(SAMPLE);
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: createAppointmentMock,
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: jest.fn(),
    };
    const findClientMock: jest.Mock =
      mocks?.findClientById ?? jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const clientsRepo: ClientRepositoryPort = {
      findById: findClientMock,
      findMany: jest.fn(),
      findByCpfCnpj: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const publishMock: jest.Mock =
      mocks?.publishOutbox ?? jest.fn().mockResolvedValue(undefined);
    const outbox: AutomationOutboxPort = {
      publish: publishMock,
      claimPending: jest.fn(),
      markProcessed: jest.fn(),
      markRetry: jest.fn(),
      markDead: jest.fn(),
    };
    const findAutomationsMock: jest.Mock =
      mocks?.findActiveAutomations ?? jest.fn().mockResolvedValue([]);
    const automationsRepo: AutomationRepositoryPort = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findActiveByEvent: jest.fn(),
      findActiveByTrigger: findAutomationsMock,
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      reorder: jest.fn(),
      hasExecution: jest.fn(),
      createExecution: () => Promise.resolve({ id: 'exec-1' }),
      completeExecution: () => Promise.resolve(),
      findHistory: jest.fn(),
    };
    const createTaskMock = mocks?.createTask ?? jest.fn().mockResolvedValue({});
    const sut = new CreateAppointmentUseCase(
      repo,
      clientsRepo,
      outbox,
      automationsRepo,
      { execute: createTaskMock } as unknown as CreateTaskUseCase,
    );
    return { sut, repo, clientsRepo, outbox, automationsRepo, createTaskMock };
  }

  it('cria a atividade no projeto e coluna escolhidos com o responsável informado', async () => {
    const createTaskMock = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ createTask: createTaskMock });

    await sut.execute({
      tipo: 'VISITA',
      titulo: 'Visita ao cliente',
      data: new Date('2026-10-01T10:00:00'),
      clienteId: 'c-1',
      projectId: 'proj-1',
      columnId: 'col-1',
      assigneeId: 'u-2',
    });

    expect(createTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projetoId: 'proj-1',
        columnId: 'col-1',
        assigneeId: 'u-2',
        appointmentId: 'a-1',
        clienteId: 'c-1',
        tipo: 'COMPROMISSO',
      }),
    );
  });

  it('desfaz o compromisso se a atividade não puder ser criada', async () => {
    const createTaskMock = jest
      .fn()
      .mockRejectedValue(new Error('Projeto inválido'));
    const { sut, repo } = makeSut({ createTask: createTaskMock });

    await expect(
      sut.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião',
        data: new Date('2026-10-01T10:00:00'),
        clienteId: 'c-1',
        projectId: 'proj-1',
      }),
    ).rejects.toThrow('Projeto inválido');

    expect(repo.delete).toHaveBeenCalledWith('a-1');
  });

  it('cria compromisso vinculado a cliente existente e herda empresaId', async () => {
    const createMock = jest.fn().mockResolvedValue(SAMPLE);
    const { sut } = makeSut({ createAppointment: createMock });

    const result = await sut.execute({
      tipo: 'VISITA',
      titulo: 'Visita ao cliente',
      data: new Date('2026-10-01T10:00:00'),
      horario: '10:00',
      clienteId: 'c-1',
    });

    expect(result).toEqual(SAMPLE);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clienteId: 'c-1',
        empresaId: 'e-1',
        endereco: 'Fazenda Boa Esperança, km 10, Aracati, CE',
      }),
    );
  });

  it('publica evento APPOINTMENT_CREATED para projetos com automação ativa', async () => {
    const sampleAutomation: Automation = {
      id: 'auto-1',
      projetoId: 'proj-comercial',
      name: 'Criar card de visita',
      description: null,
      trigger: 'APPOINTMENT_CREATED',
      conditions: [],
      conditionMode: 'AND',
      actions: [
        {
          type: 'CREATE_APPOINTMENT_TASK',
          params: { targetColumnId: 'col-1' },
        },
      ],
      schedule: null,
      isActive: true,
      priority: 0,
      createdBy: 'u-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const publishMock = jest.fn().mockResolvedValue(undefined);
    const findAutomationsMock = jest.fn().mockResolvedValue([sampleAutomation]);

    const { sut } = makeSut({
      publishOutbox: publishMock,
      findActiveAutomations: findAutomationsMock,
    });

    await sut.execute({
      tipo: 'VISITA',
      titulo: 'Visita Técnica',
      data: new Date('2026-10-01T10:00:00'),
      horario: '10:00',
      clienteId: 'c-1',
    });

    expect(findAutomationsMock).toHaveBeenCalledWith('APPOINTMENT_CREATED');
    expect(publishMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'APPOINTMENT_CREATED',
        projetoId: 'proj-comercial',
        aggregateId: 'a-1',
      }),
    );
  });

  it('lança BadRequestException se clienteId não for informado', async () => {
    const { sut } = makeSut();
    await expect(
      sut.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião',
        data: new Date('2026-10-01T10:00:00'),
        clienteId: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança NotFoundException se cliente não existir no banco', async () => {
    const findClientMock = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut({ findClientById: findClientMock });

    await expect(
      sut.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião',
        data: new Date('2026-10-01T10:00:00'),
        clienteId: 'c-ghost',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lança BadRequestException quando VISITA sem endereço e sem dados no cliente', async () => {
    const clientWithoutAddress: Client = {
      ...SAMPLE_CLIENT,
      endereco: null,
      cidade: null,
      uf: null,
    };
    const findClientMock = jest.fn().mockResolvedValue(clientWithoutAddress);
    const { sut } = makeSut({ findClientById: findClientMock });

    await expect(
      sut.execute({
        tipo: 'VISITA',
        titulo: 'Visita',
        data: new Date('2026-10-01T10:00:00'),
        clienteId: 'c-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lança BadRequestException quando data no passado', async () => {
    const { sut } = makeSut();
    await expect(
      sut.execute({
        tipo: 'REUNIAO',
        titulo: 'Reunião',
        data: new Date('2020-01-01T10:00:00'),
        clienteId: 'c-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
