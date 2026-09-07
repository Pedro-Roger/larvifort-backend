import { CommercialGroupsController } from './commercial-groups.controller';
import type { ListCommercialGroupsUseCase } from '../application/list-commercial-groups.usecase';
import type { GetCommercialGroupByIdUseCase } from '../application/get-commercial-group-by-id.usecase';
import type { CreateCommercialGroupUseCase } from '../application/create-commercial-group.usecase';
import type { UpdateCommercialGroupUseCase } from '../application/update-commercial-group.usecase';
import type { DeleteCommercialGroupUseCase } from '../application/delete-commercial-group.usecase';
import type { GetCompaniesByGroupIdUseCase } from '../application/get-companies-by-group-id.usecase';
import type { CommercialGroup, Company } from '../domain/company';

describe('CommercialGroupsController', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_COMPANY: Company = {
    id: 'e-1',
    name: 'Empresa 1',
    cnpj: null,
    city: 'Rifaina',
    status: 'ATIVA',
    grupoId: 'g-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const deleteExecute = jest.fn();
    const getCompaniesExecute = jest.fn();

    const listGroups = {
      execute: listExecute,
    } as unknown as ListCommercialGroupsUseCase;
    const getGroupById = {
      execute: getExecute,
    } as unknown as GetCommercialGroupByIdUseCase;
    const createGroup = {
      execute: createExecute,
    } as unknown as CreateCommercialGroupUseCase;
    const updateGroup = {
      execute: updateExecute,
    } as unknown as UpdateCommercialGroupUseCase;
    const deleteGroup = {
      execute: deleteExecute,
    } as unknown as DeleteCommercialGroupUseCase;
    const getCompanies = {
      execute: getCompaniesExecute,
    } as unknown as GetCompaniesByGroupIdUseCase;

    const sut = new CommercialGroupsController(
      listGroups,
      getGroupById,
      createGroup,
      updateGroup,
      deleteGroup,
      getCompanies,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
      getCompaniesExecute,
    };
  }

  it('findAll delega para ListCommercialGroupsUseCase', async () => {
    const { sut, listExecute } = makeSut();
    listExecute.mockResolvedValue([SAMPLE_GROUP]);

    const result = await sut.findAll();

    expect(listExecute).toHaveBeenCalled();
    expect(result).toEqual([SAMPLE_GROUP]);
  });

  it('findById delega para GetCommercialGroupByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_GROUP);

    const result = await sut.findById('g-1');

    expect(getExecute).toHaveBeenCalledWith('g-1');
    expect(result).toEqual(SAMPLE_GROUP);
  });

  it('findCompanies delega para GetCompaniesByGroupIdUseCase', async () => {
    const { sut, getCompaniesExecute } = makeSut();
    getCompaniesExecute.mockResolvedValue([SAMPLE_COMPANY]);

    const result = await sut.findCompanies('g-1');

    expect(getCompaniesExecute).toHaveBeenCalledWith('g-1');
    expect(result).toEqual([SAMPLE_COMPANY]);
  });

  it('create delega para CreateCommercialGroupUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_GROUP);

    const dto = { name: 'Coopercitrus', color: '#16a34a' };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_GROUP);
  });

  it('update delega para UpdateCommercialGroupUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_GROUP, name: 'Novo' });

    const result = await sut.update('g-1', { name: 'Novo' });

    expect(updateExecute).toHaveBeenCalledWith('g-1', { name: 'Novo' });
    expect(result.name).toBe('Novo');
  });

  it('delete delega para DeleteCommercialGroupUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('g-1');

    expect(deleteExecute).toHaveBeenCalledWith('g-1');
  });
});
