import { TaskTransferController } from './task-transfer.controller';
import type { GetTaskByIdUseCase } from '../application/get-task-by-id.usecase';
import type { CreateTaskUseCase } from '../application/create-task.usecase';
import type { UpdateTaskUseCase } from '../application/update-task.usecase';
import type { Task } from '../domain/task';
import { NotFoundException } from '@nestjs/common';

describe('TaskTransferController', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'board-1',
    titulo: 'Tarefa Principal',
    descricao: 'Desc',
    status: 'EM_ANDAMENTO',
    prioridade: 'ALTA',
    progresso: 50,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const getTaskMock = jest.fn();
    const createTaskMock = jest.fn();
    const updateTaskMock = jest.fn();

    const getTaskById = {
      execute: (id: string): Promise<Task | null> =>
        getTaskMock(id) as Promise<Task | null>,
    } as unknown as GetTaskByIdUseCase;
    const createTask = {
      execute: (dto: any): Promise<Task> =>
        createTaskMock(dto) as Promise<Task>,
    } as unknown as CreateTaskUseCase;
    const updateTask = {
      execute: (id: string, dto: any): Promise<Task> =>
        updateTaskMock(id, dto) as Promise<Task>,
    } as unknown as UpdateTaskUseCase;

    const sut = new TaskTransferController(getTaskById, createTask, updateTask);

    return { sut, getTaskMock, createTaskMock, updateTaskMock };
  }

  it('lança NotFoundException se tarefa não existir', async () => {
    const { sut, getTaskMock } = makeSut();
    getTaskMock.mockResolvedValue(null);

    await expect(
      sut.transfer('t-missing', {
        targetBoardId: 'board-2',
        mode: 'MOVE',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('mode MOVE move a tarefa para o novo quadro', async () => {
    const { sut, getTaskMock, updateTaskMock } = makeSut();
    getTaskMock.mockResolvedValue(SAMPLE_TASK);
    const movedTask = { ...SAMPLE_TASK, projetoId: 'board-2' };
    updateTaskMock.mockResolvedValue(movedTask);

    const result = await sut.transfer('t-1', {
      targetBoardId: 'board-2',
      mode: 'MOVE',
    });

    expect(updateTaskMock).toHaveBeenCalledWith('t-1', {
      projetoId: 'board-2',
      columnId: null,
    });
    expect(result.originalTask).toEqual(movedTask);
  });

  it('mode CHILD_TASK cria nova tarefa no quadro de destino', async () => {
    const { sut, getTaskMock, createTaskMock } = makeSut();
    getTaskMock.mockResolvedValue(SAMPLE_TASK);
    const childTask = { ...SAMPLE_TASK, id: 't-child', projetoId: 'board-2' };
    createTaskMock.mockResolvedValue(childTask);

    const result = await sut.transfer('t-1', {
      targetBoardId: 'board-2',
      mode: 'CHILD_TASK',
      note: 'Favor assumir',
    });

    expect(createTaskMock).toHaveBeenCalled();
    expect(result.originalTask).toEqual(SAMPLE_TASK);
    expect(result.targetTask).toEqual(childTask);
  });
});
