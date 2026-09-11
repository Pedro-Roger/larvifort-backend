import { BoardColumnsController } from './board-columns.controller';
import type { ListProjectColumnsUseCase } from '../application/list-project-columns.usecase';
import type { CreateProjectColumnUseCase } from '../application/create-project-column.usecase';
import type { UpdateProjectColumnUseCase } from '../application/update-project-column.usecase';
import type { DeleteProjectColumnUseCase } from '../application/delete-project-column.usecase';
import type { ReorderProjectColumnsUseCase } from '../application/reorder-project-columns.usecase';
import type { ProjectColumn } from '../domain/task';
import type { CreateProjectColumnDto } from './dto/create-project-column.dto';
import type { UpdateProjectColumnDto } from './dto/update-project-column.dto';

describe('BoardColumnsController', () => {
  const SAMPLE_COLUMN: ProjectColumn = {
    id: 'col-1',
    projetoId: 'board-1',
    title: 'Backlog',
    order: 0,
    color: '#0ea5e9',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listColsMock = jest.fn();
    const createColMock = jest.fn();
    const updateColMock = jest.fn();
    const deleteColMock = jest.fn();
    const reorderColsMock = jest.fn();

    const listCols = {
      execute: (id: string): Promise<ProjectColumn[]> =>
        listColsMock(id) as Promise<ProjectColumn[]>,
    } as unknown as ListProjectColumnsUseCase;
    const createCol = {
      execute: (
        id: string,
        dto: CreateProjectColumnDto,
      ): Promise<ProjectColumn> =>
        createColMock(id, dto) as Promise<ProjectColumn>,
    } as unknown as CreateProjectColumnUseCase;
    const updateCol = {
      execute: (
        id: string,
        dto: UpdateProjectColumnDto,
      ): Promise<ProjectColumn> =>
        updateColMock(id, dto) as Promise<ProjectColumn>,
    } as unknown as UpdateProjectColumnUseCase;
    const deleteCol = {
      execute: (id: string): Promise<void> =>
        deleteColMock(id) as Promise<void>,
    } as unknown as DeleteProjectColumnUseCase;
    const reorderCols = {
      execute: (id: string, ids: string[]): Promise<ProjectColumn[]> =>
        reorderColsMock(id, ids) as Promise<ProjectColumn[]>,
    } as unknown as ReorderProjectColumnsUseCase;

    const sut = new BoardColumnsController(
      listCols,
      createCol,
      updateCol,
      deleteCol,
      reorderCols,
    );

    return {
      sut,
      listColsMock,
      createColMock,
      updateColMock,
      deleteColMock,
      reorderColsMock,
    };
  }

  it('findBoardColumns retorna colunas do quadro', async () => {
    const { sut, listColsMock } = makeSut();
    listColsMock.mockResolvedValue([SAMPLE_COLUMN]);

    const result = await sut.findBoardColumns('board-1');
    expect(listColsMock).toHaveBeenCalledWith('board-1');
    expect(result).toEqual([SAMPLE_COLUMN]);
  });

  it('createBoardColumn cria coluna no quadro', async () => {
    const { sut, createColMock } = makeSut();
    createColMock.mockResolvedValue(SAMPLE_COLUMN);

    const dto = { title: 'Backlog', color: '#0ea5e9', order: 0 };
    const result = await sut.createBoardColumn('board-1', dto);
    expect(createColMock).toHaveBeenCalledWith('board-1', dto);
    expect(result).toEqual(SAMPLE_COLUMN);
  });

  it('reorderBoardColumns aceita columnOrders array', async () => {
    const { sut, reorderColsMock } = makeSut();
    reorderColsMock.mockResolvedValue([SAMPLE_COLUMN]);

    const dto = {
      columnIds: [],
      columnOrders: [{ id: 'col-1', order: 0 }],
    };
    await sut.reorderBoardColumns('board-1', dto);
    expect(reorderColsMock).toHaveBeenCalledWith('board-1', ['col-1']);
  });

  it('updateDirectColumn atualiza coluna por columnId', async () => {
    const { sut, updateColMock } = makeSut();
    updateColMock.mockResolvedValue(SAMPLE_COLUMN);

    const dto = { title: 'Novo Titulo' };
    const result = await sut.updateDirectColumn('col-1', dto);
    expect(updateColMock).toHaveBeenCalledWith('col-1', dto);
    expect(result).toEqual(SAMPLE_COLUMN);
  });

  it('deleteDirectColumn exclui coluna por columnId', async () => {
    const { sut, deleteColMock } = makeSut();
    deleteColMock.mockResolvedValue(undefined);

    await sut.deleteDirectColumn('col-1');
    expect(deleteColMock).toHaveBeenCalledWith('col-1');
  });
});
