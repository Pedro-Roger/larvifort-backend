import { ListTasksUseCase } from './list-tasks.usecase';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import type { Task } from '../domain/task';

describe('ListTasksUseCase', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    titulo: 'Desenvolver API',
    descricao: null,
    status: 'BACKLOG',
    prioridade: 'MEDIA',
    progresso: 0,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna lista paginada de tarefas', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_TASK], total: 1 });
    const tasks = { findMany } as unknown as TaskRepositoryPort;
    const sut = new ListTasksUseCase(tasks);

    const result = await sut.execute({ page: 1, limit: 10, search: 'API' });

    expect(findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'API',
    });
    expect(result).toEqual({
      data: [SAMPLE_TASK],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });
});
