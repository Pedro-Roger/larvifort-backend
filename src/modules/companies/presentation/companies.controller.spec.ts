import { CompaniesController } from './companies.controller';
import type { ListCompaniesUseCase } from '../application/list-companies.usecase';
import type { GetCompanyByIdUseCase } from '../application/get-company-by-id.usecase';
import type { CreateCompanyUseCase } from '../application/create-company.usecase';
import type { UpdateCompanyUseCase } from '../application/update-company.usecase';
import type { DeleteCompanyUseCase } from '../application/delete-company.usecase';
import type { ListCommercialGroupsUseCase } from '../application/list-commercial-groups.usecase';
import type { Company } from '../domain/company';

describe('CompaniesController', () => {
  const SAMPLE_COMPANY: Company = {
    id: 'e-1',
    name: 'Fazenda Rio Grande Ltda',
    cnpj: '12345678000199',
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
    const listGroupsExecute = jest.fn();

    const listCompanies = {
      execute: listExecute,
    } as unknown as ListCompaniesUseCase;
    const getCompanyById = {
      execute: getExecute,
    } as unknown as GetCompanyByIdUseCase;
    const createCompany = {
      execute: createExecute,
    } as unknown as CreateCompanyUseCase;
    const updateCompany = {
      execute: updateExecute,
    } as unknown as UpdateCompanyUseCase;
    const deleteCompany = {
      execute: deleteExecute,
    } as unknown as DeleteCompanyUseCase;
    const listGroups = {
      execute: listGroupsExecute,
    } as unknown as ListCommercialGroupsUseCase;

    const sut = new CompaniesController(
      listCompanies,
      getCompanyById,
      createCompany,
      updateCompany,
      deleteCompany,
      listGroups,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
    };
  }

  it('findMany delega para ListCompaniesUseCase', async () => {
    const { sut, listExecute } = makeSut();
    const paginatedResult = {
      data: [SAMPLE_COMPANY],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    listExecute.mockResolvedValue(paginatedResult);

    const result = await sut.findMany({ page: 1, limit: 10, search: 'rio' });

    expect(listExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'rio',
    });
    expect(result).toEqual(paginatedResult);
  });

  it('findById delega para GetCompanyByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_COMPANY);

    const result = await sut.findById('e-1');

    expect(getExecute).toHaveBeenCalledWith('e-1');
    expect(result).toEqual(SAMPLE_COMPANY);
  });

  it('create delega para CreateCompanyUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_COMPANY);

    const dto = { name: 'Fazenda Rio Grande Ltda', cnpj: '12345678000199' };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_COMPANY);
  });

  it('update delega para UpdateCompanyUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_COMPANY, name: 'Novo Nome' });

    const result = await sut.update('e-1', { name: 'Novo Nome' });

    expect(updateExecute).toHaveBeenCalledWith('e-1', { name: 'Novo Nome' });
    expect(result.name).toBe('Novo Nome');
  });

  it('delete delega para DeleteCompanyUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('e-1');

    expect(deleteExecute).toHaveBeenCalledWith('e-1');
  });
});
