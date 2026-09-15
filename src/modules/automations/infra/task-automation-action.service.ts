import { Inject, Injectable } from '@nestjs/common';
import type { AutomationAction, AutomationEvent } from '../domain/automation';
import type { AutomationActionPort } from '../application/ports/automation-action.port';

export const PRISMA_AUTOMATION_ACTION_TOKEN = 'PRISMA_AUTOMATION_ACTION_TOKEN';

interface PrismaTaskActions {
  task: {
    findFirst(args: Record<string, unknown>): Promise<{ id: string } | null>;
    update(args: Record<string, unknown>): Promise<unknown>;
    create(args: Record<string, unknown>): Promise<unknown>;
  };
}

@Injectable()
export class TaskAutomationActionService implements AutomationActionPort {
  constructor(
    @Inject(PRISMA_AUTOMATION_ACTION_TOKEN)
    private readonly prisma: PrismaTaskActions,
  ) {}

  async execute(
    action: AutomationAction,
    event: AutomationEvent,
  ): Promise<void> {
    if (action.type === 'NOTIFY') return;

    if (action.type === 'CREATE_APPOINTMENT_TASK') {
      const appointmentId =
        (event.payload.appointmentId as string) || event.aggregateId;
      const targetColumnId =
        (action.params.targetColumnId as string) ||
        (action.params.columnId as string) ||
        null;

      // Idempotência: não duplica card para o mesmo appointment no projeto
      const existing = await this.prisma.task.findFirst({
        where: {
          appointmentId,
          projetoId: event.projetoId,
        },
      });

      if (existing) {
        return;
      }

      const p = event.payload || {};
      const tituloStr = typeof p.titulo === 'string' ? p.titulo : '';
      const tipoStr = typeof p.tipo === 'string' ? p.tipo : 'Visita';
      const titulo = tituloStr || `Compromisso: ${tipoStr}`;

      const dataVal =
        typeof p.data === 'string' || p.data instanceof Date
          ? String(p.data)
          : '';
      const dataStr = dataVal
        ? new Date(dataVal).toLocaleDateString('pt-BR')
        : '';

      const horarioVal = typeof p.horario === 'string' ? p.horario : '';
      const horarioStr = horarioVal ? ` às ${horarioVal}` : '';

      const enderecoVal = typeof p.endereco === 'string' ? p.endereco : '';
      const enderecoStr = enderecoVal ? `\nEndereço: ${enderecoVal}` : '';

      const obsVal = typeof p.observacoes === 'string' ? p.observacoes : '';
      const obsStr = obsVal ? `\nObs: ${obsVal}` : '';

      const descricao =
        `Compromisso agendado para ${dataStr}${horarioStr}.${enderecoStr}${obsStr}`.trim();

      await this.prisma.task.create({
        data: {
          projetoId: event.projetoId,
          columnId: targetColumnId,
          titulo,
          descricao,
          tipo: 'COMPROMISSO',
          appointmentId,
          clienteId: typeof p.clienteId === 'string' ? p.clienteId : null,
          status: 'BACKLOG',
          prioridade: 'MEDIA',
          progresso: 0,
          tags: ['COMPROMISSO'],
        },
      });
      return;
    }

    if (action.type === 'CREATE_LINKED_TASK') {
      await this.prisma.task.create({
        data: {
          projetoId: event.projetoId,
          titulo:
            typeof action.params.title === 'string'
              ? action.params.title
              : 'Tarefa automática',
          descricao: `Criada pela automação a partir de ${event.aggregateId}`,
          columnId: action.params.columnId,
          tipo: 'GERAL',
        },
      });
      return;
    }

    const data = this.updateData(action);
    await this.prisma.task.update({
      where: { id: event.aggregateId },
      data,
    });
  }

  private updateData(action: AutomationAction): Record<string, unknown> {
    switch (action.type) {
      case 'MOVE_TASK':
        return { columnId: action.params.columnId };
      case 'ASSIGN_TASK':
        return { assigneeId: action.params.userId };
      case 'SET_PRIORITY':
        return { prioridade: action.params.priority };
      case 'ADD_TAG':
        return { tags: { push: String(action.params.tag) } };
      case 'REMOVE_TAG':
        return { tags: action.params.tagsWithoutRemoved ?? [] };
      case 'SET_DUE_DATE':
        return { prazo: new Date(String(action.params.dueDate)) };
      default:
        return {};
    }
  }
}
