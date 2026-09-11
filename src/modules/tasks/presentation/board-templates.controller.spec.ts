import { BoardTemplatesController } from './board-templates.controller';
import type { CreateTaskUseCase } from '../application/create-task.usecase';
import {
  PROJECT_TEMPLATES,
  type ProjectTemplate,
} from '../domain/project-template';
import type { Task } from '../domain/task';
import type { CreateTaskData } from '../application/ports/task-repository.port';

describe('BoardTemplatesController', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'board-1',
    titulo: 'Tarefa do Template',
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

  function makeSut() {
    const listTemplatesMock = jest.fn();
    const getTemplateMock = jest.fn();
    const createTaskMock = jest.fn();

    const listTemplates = {
      execute: (): ProjectTemplate[] =>
        listTemplatesMock() as ProjectTemplate[],
    };
    const getTemplateById = {
      execute: (id: string): ProjectTemplate =>
        getTemplateMock(id) as ProjectTemplate,
    };
    const createTask = {
      execute: (dto: CreateTaskData): Promise<Task> =>
        createTaskMock(dto) as Promise<Task>,
    } as unknown as CreateTaskUseCase;

    const sut = new BoardTemplatesController(
      listTemplates,
      getTemplateById,
      createTask,
    );

    return { sut, listTemplatesMock, getTemplateMock, createTaskMock };
  }

  it('findBoardTemplates retorna templates mapeados para o boardId', () => {
    const { sut, listTemplatesMock } = makeSut();
    listTemplatesMock.mockReturnValue(PROJECT_TEMPLATES);

    const result = sut.findBoardTemplates('board-1');
    expect(result).toHaveLength(PROJECT_TEMPLATES.length);
    expect(result[0].boardId).toBe('board-1');
  });

  it('createBoardTemplate cria template com boardId', () => {
    const { sut } = makeSut();
    const result = sut.createBoardTemplate('board-1', {
      name: 'Meu Template',
      description: 'Desc',
    });

    expect(result.boardId).toBe('board-1');
    expect(result.name).toBe('Meu Template');
  });

  it('updateBoardTemplate mescla updates', () => {
    const { sut } = makeSut();
    const result = sut.updateBoardTemplate('tmpl-1', { name: 'Novo Nome' });
    expect(result.id).toBe('tmpl-1');
    expect(result.name).toBe('Novo Nome');
  });

  it('deleteBoardTemplate conclui sem erro', () => {
    const { sut } = makeSut();
    expect(() => sut.deleteBoardTemplate()).not.toThrow();
  });

  it('reorderBoardTemplates conclui sem erro', () => {
    const { sut } = makeSut();
    expect(() => sut.reorderBoardTemplates()).not.toThrow();
  });

  it('applyBoardTemplate cria tarefa baseada no template', async () => {
    const { sut, getTemplateMock, createTaskMock } = makeSut();
    getTemplateMock.mockReturnValue(PROJECT_TEMPLATES[0]);
    createTaskMock.mockResolvedValue(SAMPLE_TASK);

    const result = await sut.applyBoardTemplate('vazio', {
      projetoId: 'board-1',
      titulo: 'Minha Tarefa',
    });

    expect(getTemplateMock).toHaveBeenCalledWith('vazio');
    expect(createTaskMock).toHaveBeenCalled();
    expect(result).toEqual(SAMPLE_TASK);
  });
});
