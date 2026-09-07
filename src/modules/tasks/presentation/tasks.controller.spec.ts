import { TasksController } from './tasks.controller';
import type { ListTasksUseCase } from '../application/list-tasks.usecase';
import type { GetTaskByIdUseCase } from '../application/get-task-by-id.usecase';
import type { CreateTaskUseCase } from '../application/create-task.usecase';
import type { UpdateTaskUseCase } from '../application/update-task.usecase';
import type { UpdateTaskStatusUseCase } from '../application/update-task-status.usecase';
import type { DeleteTaskUseCase } from '../application/delete-task.usecase';
import type { Task } from '../domain/task';

describe('TasksController', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    titulo: 'Desenvolver API',
    descricao: null,
    status: 'EM_ANDAMENTO',
    prioridade: 'MEDIA',
    progresso: 50,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const statusExecute = jest.fn();
    const deleteExecute = jest.fn();

    const listTasks = { execute: listExecute } as unknown as ListTasksUseCase;
    const getTaskById = {
      execute: getExecute,
    } as unknown as GetTaskByIdUseCase;
    const createTask = {
      execute: createExecute,
    } as unknown as CreateTaskUseCase;
    const updateTask = {
      execute: updateExecute,
    } as unknown as UpdateTaskUseCase;
    const updateTaskStatus = {
      execute: statusExecute,
    } as unknown as UpdateTaskStatusUseCase;
    const deleteTask = {
      execute: deleteExecute,
    } as unknown as DeleteTaskUseCase;

    const sut = new TasksController(
      listTasks,
      getTaskById,
      createTask,
      updateTask,
      updateTaskStatus,
      deleteTask,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      statusExecute,
      deleteExecute,
    };
  }

  it('findMany delega para ListTasksUseCase', async () => {
    const { sut, listExecute } = makeSut();
    const paginatedResult = {
      data: [SAMPLE_TASK],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    listExecute.mockResolvedValue(paginatedResult);

    const result = await sut.findMany({ page: 1, limit: 10, search: 'API' });

    expect(listExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'API',
    });
    expect(result).toEqual(paginatedResult);
  });

  it('findById delega para GetTaskByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_TASK);

    const result = await sut.findById('t-1');

    expect(getExecute).toHaveBeenCalledWith('t-1');
    expect(result).toEqual(SAMPLE_TASK);
  });

  it('create delega para CreateTaskUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_TASK);

    const dto = { projetoId: 'p-1', titulo: 'Desenvolver API' };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_TASK);
  });

  it('update delega para UpdateTaskUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_TASK, titulo: 'Novo' });

    const result = await sut.update('t-1', { titulo: 'Novo' });

    expect(updateExecute).toHaveBeenCalledWith('t-1', { titulo: 'Novo' });
    expect(result.titulo).toBe('Novo');
  });

  it('updateStatus delega para UpdateTaskStatusUseCase', async () => {
    const { sut, statusExecute } = makeSut();
    statusExecute.mockResolvedValue({ ...SAMPLE_TASK, status: 'CONCLUIDO' });

    const result = await sut.updateStatus('t-1', { status: 'CONCLUIDO' });

    expect(statusExecute).toHaveBeenCalledWith('t-1', { status: 'CONCLUIDO' });
    expect(result.status).toBe('CONCLUIDO');
  });

  it('updateProgresso delega para UpdateTaskUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_TASK, progresso: 80 });

    const result = await sut.updateProgresso('t-1', 80);

    expect(updateExecute).toHaveBeenCalledWith('t-1', { progresso: 80 });
    expect(result.progresso).toBe(80);
  });

  it('delete delega para DeleteTaskUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('t-1');

    expect(deleteExecute).toHaveBeenCalledWith('t-1');
  });
});
