import { Inject, Injectable } from '@nestjs/common';
import type {
  Prioridade,
  StatusTarefa,
  Task,
  TaskActivityConfirmation,
  TipoTask,
} from '../domain/task';
import type {
  ConfirmActivityRepoData,
  CreateTaskData,
  FindTasksFilter,
  TaskRepositoryPort,
  UpdateTaskData,
} from '../application/ports/task-repository.port';

export const PRISMA_TASKS_TOKEN = 'PRISMA_TASKS_TOKEN';

interface ConfirmationRow {
  id: string;
  taskId: string;
  confirmedById: string;
  confirmedAt: Date;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  createdAt: Date;
}

interface TaskRow {
  id: string;
  projetoId: string;
  columnId?: string | null;
  titulo: string;
  referenceNumber?: number | null;
  referenceCode?: string | null;
  descricao: string | null;
  status: StatusTarefa;
  tipo?: TipoTask;
  appointmentId?: string | null;
  clienteId?: string | null;
  confirmation?: ConfirmationRow | null;
  prioridade: Prioridade;
  progresso: number;
  tags: string[];
  prazo: Date | null;
  estimativaH: number | null;
  assigneeId: string | null;
  assignee?: { firstName: string; lastName: string } | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaTaskCrud {
  task: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      select: Record<string, unknown>;
    }): Promise<TaskRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: {
      where: { id?: string; appointmentId?: string };
      select: Record<string, unknown>;
    }): Promise<TaskRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<TaskRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<TaskRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
  taskActivityConfirmation?: {
    findUnique(args: {
      where: { taskId: string };
      select: Record<string, unknown>;
    }): Promise<ConfirmationRow | null>;
    create(args: {
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    }): Promise<ConfirmationRow>;
  };
}

const CONFIRMATION_SELECT = {
  id: true,
  taskId: true,
  confirmedById: true,
  confirmedAt: true,
  latitude: true,
  longitude: true,
  accuracyMeters: true,
  createdAt: true,
} as const;

const TASK_SELECT = {
  id: true,
  projetoId: true,
  columnId: true,
  titulo: true,
  referenceNumber: true,
  referenceCode: true,
  descricao: true,
  status: true,
  tipo: true,
  appointmentId: true,
  clienteId: true,
  confirmation: {
    select: CONFIRMATION_SELECT,
  },
  prioridade: true,
  progresso: true,
  tags: true,
  prazo: true,
  estimativaH: true,
  assigneeId: true,
  parentId: true,
  assignee: {
    select: { firstName: true, lastName: true },
  },
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
  constructor(
    @Inject(PRISMA_TASKS_TOKEN)
    private readonly prisma: PrismaTaskCrud,
  ) {}

  async findMany(
    filter: FindTasksFilter,
  ): Promise<{ data: Task[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.projetoId !== undefined) {
      where.projetoId = filter.projetoId;
    }
    if (filter.columnId !== undefined) {
      where.columnId = filter.columnId;
    }
    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.tipo !== undefined) {
      where.tipo = filter.tipo;
    }
    if (filter.appointmentId !== undefined) {
      where.appointmentId = filter.appointmentId;
    }
    if (filter.clienteId !== undefined) {
      where.clienteId = filter.clienteId;
    }
    if (filter.parentId !== undefined) {
      where.parentId = filter.parentId;
    }
    if (filter.assigneeId !== undefined) {
      where.assigneeId = filter.assigneeId;
    }
    if (filter.search?.trim()) {
      const s = filter.search.trim();
      where.OR = [
        { titulo: { contains: s, mode: 'insensitive' } },
        { descricao: { contains: s, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: TASK_SELECT,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({
      where: { id },
      select: TASK_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async findByAppointmentId(appointmentId: string): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({
      where: { appointmentId },
      select: TASK_SELECT,
    });
    return row ? this.toDomain(row) : null;
  }

  async create(data: CreateTaskData): Promise<Task> {
    const tags = data.tags
      ? Array.from(new Set(data.tags.map((t) => t.trim()))).slice(0, 5)
      : [];

    const columnId = data.columnId?.trim() || null;
    const appointmentId = data.appointmentId?.trim() || null;
    const clienteId = data.clienteId?.trim() || null;
    const assigneeId = data.assigneeId?.trim() || null;

    const row = await this.prisma.task.create({
      data: {
        projetoId: data.projetoId,
        columnId,
        titulo: data.titulo.trim(),
        ...(data.referenceNumber !== undefined
          ? { referenceNumber: data.referenceNumber }
          : {}),
        ...(data.referenceCode !== undefined
          ? { referenceCode: data.referenceCode }
          : {}),
        descricao: data.descricao?.trim() ?? null,
        status: data.status ?? 'BACKLOG',
        tipo: data.tipo ?? 'GERAL',
        appointmentId,
        clienteId,
        prioridade: data.prioridade ?? 'MEDIA',
        progresso: Math.max(0, Math.min(100, data.progresso ?? 0)),
        tags,
        prazo: data.prazo ?? null,
        estimativaH: data.estimativaH ?? null,
        assigneeId,
        parentId: data.parentId?.trim() || null,
      },
      select: TASK_SELECT,
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const updateData: Record<string, unknown> = {};

    if (data.projetoId !== undefined) updateData.projetoId = data.projetoId;
    if (data.columnId !== undefined)
      updateData.columnId = data.columnId?.trim() || null;
    if (data.titulo !== undefined) updateData.titulo = data.titulo.trim();
    if (data.descricao !== undefined)
      updateData.descricao = data.descricao?.trim() ?? null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.prioridade !== undefined) updateData.prioridade = data.prioridade;
    if (data.progresso !== undefined)
      updateData.progresso = Math.max(0, Math.min(100, data.progresso));
    if (data.tags !== undefined) {
      updateData.tags = Array.from(
        new Set(data.tags.map((t) => t.trim())),
      ).slice(0, 5);
    }
    if (data.prazo !== undefined) updateData.prazo = data.prazo;
    if (data.estimativaH !== undefined)
      updateData.estimativaH = data.estimativaH;
    if (data.assigneeId !== undefined)
      updateData.assigneeId = data.assigneeId?.trim() || null;
    if (data.clienteId !== undefined)
      updateData.clienteId = data.clienteId?.trim() || null;

    const row = await this.prisma.task.update({
      where: { id },
      data: updateData,
      select: TASK_SELECT,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async confirmActivity(
    taskId: string,
    data: ConfirmActivityRepoData,
  ): Promise<TaskActivityConfirmation> {
    if (this.prisma.taskActivityConfirmation) {
      const created = await this.prisma.taskActivityConfirmation.create({
        data: {
          taskId,
          confirmedById: data.confirmedById,
          confirmedAt: data.confirmedAt,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracyMeters: data.accuracyMeters,
        },
        select: CONFIRMATION_SELECT,
      });
      return created;
    }

    return {
      id: `conf-${Date.now()}`,
      taskId,
      confirmedById: data.confirmedById,
      confirmedAt: data.confirmedAt,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters,
      createdAt: data.confirmedAt,
    };
  }

  async findConfirmationByTaskId(
    taskId: string,
  ): Promise<TaskActivityConfirmation | null> {
    if (this.prisma.taskActivityConfirmation) {
      return this.prisma.taskActivityConfirmation.findUnique({
        where: { taskId },
        select: CONFIRMATION_SELECT,
      });
    }
    return null;
  }

  async syncParentProgress(parentId: string): Promise<void> {
    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where: { parentId } }),
      this.prisma.task.count({ where: { parentId, status: 'CONCLUIDO' } }),
    ]);
    if (total === 0) return;

    const progresso = Math.round((completed / total) * 100);
    await this.prisma.task.update({
      where: { id: parentId },
      data: {
        progresso,
        status: progresso === 100 ? 'CONCLUIDO' : 'EM_ANDAMENTO',
      },
      select: TASK_SELECT,
    });
  }

  private toDomain(row: TaskRow): Task {
    return {
      id: row.id,
      projetoId: row.projetoId,
      columnId: row.columnId ?? null,
      titulo: row.titulo,
      ...(row.referenceCode !== undefined
        ? {
            referenceNumber: row.referenceNumber ?? null,
            referenceCode: row.referenceCode,
          }
        : {}),
      descricao: row.descricao,
      status: row.status,
      tipo: row.tipo ?? 'GERAL',
      appointmentId: row.appointmentId ?? null,
      clienteId: row.clienteId ?? null,
      confirmation: row.confirmation ?? null,
      prioridade: row.prioridade,
      progresso: row.progresso,
      tags: row.tags,
      prazo: row.prazo,
      estimativaH: row.estimativaH,
      assigneeId: row.assigneeId,
      assignee: row.assignee ?? null,
      parentId: row.parentId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
