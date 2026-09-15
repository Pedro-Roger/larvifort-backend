import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import type { Appointment } from '../domain/appointment';
import type {
  AppointmentRepositoryPort,
  CreateAppointmentData,
} from './ports/appointment-repository.port';
import { APPOINTMENT_REPOSITORY_PORT } from './ports/appointment-repository.port';
import type { ClientRepositoryPort } from '../../clients/application/ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from '../../clients/application/ports/client-repository.port';
import {
  AUTOMATION_OUTBOX_PORT,
  type AutomationOutboxPort,
} from '../../automations/application/ports/automation-outbox.port';
import {
  AUTOMATION_REPOSITORY_PORT,
  type AutomationRepositoryPort,
} from '../../automations/application/ports/automation-repository.port';
import { CreateTaskUseCase } from '../../tasks/application/create-task.usecase';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY_PORT)
    private readonly repo: AppointmentRepositoryPort,
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clientsRepo: ClientRepositoryPort,
    @Optional()
    @Inject(AUTOMATION_OUTBOX_PORT)
    private readonly outbox?: AutomationOutboxPort,
    @Optional()
    @Inject(AUTOMATION_REPOSITORY_PORT)
    private readonly automationsRepo?: AutomationRepositoryPort,
    @Optional()
    @Inject(CreateTaskUseCase)
    private readonly createTask?: CreateTaskUseCase,
  ) {}

  async execute(data: CreateAppointmentData): Promise<Appointment> {
    if (!data.clienteId?.trim()) {
      throw new BadRequestException(
        'Compromissos devem estar vinculados a um cliente cadastrado.',
      );
    }

    const client = await this.clientsRepo.findById(data.clienteId.trim());
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    let endereco = data.endereco?.trim() || null;
    if (data.tipo === 'VISITA' && !endereco) {
      if (client.endereco || client.cidade) {
        endereco = [client.endereco, client.cidade, client.uf]
          .filter(Boolean)
          .join(', ');
      }
      if (!endereco) {
        throw new BadRequestException(
          'Compromissos do tipo VISITA devem ter endereço.',
        );
      }
    }

    const empresaId = data.empresaId || client.empresaId || null;

    const now = new Date();
    const dataCompromisso = new Date(data.data);
    if (dataCompromisso < now) {
      throw new BadRequestException(
        'Não é possível criar compromisso com data no passado.',
      );
    }

    const created = await this.repo.create({
      ...data,
      clienteId: client.id,
      empresaId,
      endereco,
    });

    if (this.createTask && data.projectId) {
      try {
        await this.createTask.execute({
          projetoId: data.projectId,
          columnId: data.columnId ?? null,
          titulo: created.titulo,
          descricao: created.observacoes,
          tipo: 'COMPROMISSO',
          appointmentId: created.id,
          clienteId: created.clienteId,
          assigneeId: data.assigneeId ?? created.ownerId,
          prazo: created.data,
        });
      } catch (error) {
        try {
          await this.repo.delete(created.id);
        } catch {
          // Preserve the original task creation error.
        }
        throw error;
      }
    }

    // Publicação assíncrona/outbox de APPOINTMENT_CREATED para automações de quadro
    if (this.outbox && this.automationsRepo) {
      try {
        const automations = await this.automationsRepo.findActiveByTrigger(
          'APPOINTMENT_CREATED',
        );
        const uniqueProjectIds = Array.from(
          new Set(automations.map((a) => a.projetoId)),
        );
        for (const projetoId of uniqueProjectIds) {
          await this.outbox.publish({
            id: `evt-app-${created.id}-${projetoId}-${Date.now()}`,
            type: 'APPOINTMENT_CREATED',
            projetoId,
            aggregateId: created.id,
            payload: {
              appointmentId: created.id,
              clienteId: created.clienteId,
              titulo: created.titulo,
              tipo: created.tipo,
              data: created.data,
              horario: created.horario,
              endereco: created.endereco,
              observacoes: created.observacoes,
            },
            depth: 0,
            causationChain: [],
            occurredAt: new Date(),
          });
        }
      } catch {
        // Falha no disparo de automações nunca desfaz o compromisso criado
      }
    }

    return created;
  }
}
