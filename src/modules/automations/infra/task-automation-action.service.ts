import { Inject, Injectable } from '@nestjs/common';
import type { AutomationAction, AutomationEvent } from '../domain/automation';
import type { AutomationActionPort } from '../application/ports/automation-action.port';

export const PRISMA_AUTOMATION_ACTION_TOKEN = 'PRISMA_AUTOMATION_ACTION_TOKEN';

interface PrismaTaskActions {
  task: {
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
    if (action.type === 'CREATE_LINKED_TASK') {
      await this.prisma.task.create({
        data: {
          projetoId: event.projetoId,
          title:
            typeof action.params.title === 'string'
              ? action.params.title
              : 'Tarefa automática',
          description: `Criada pela automação a partir de ${event.aggregateId}`,
          columnId: action.params.columnId,
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
        return { dueDate: new Date(String(action.params.dueDate)) };
      default:
        return {};
    }
  }
}
