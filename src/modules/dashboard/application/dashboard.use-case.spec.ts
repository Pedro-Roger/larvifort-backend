import type { DashboardRepositoryPort } from '../domain/dashboard.repository.port';
import { DashboardUseCase } from './dashboard.use-case';

describe('DashboardUseCase', () => {
  it('delega cada leitura ao repositório', async () => {
    const resumo = jest.fn().mockResolvedValue({});
    const frequenciaVisitas = jest.fn().mockResolvedValue([]);
    const atividadeClientes = jest.fn().mockResolvedValue([]);
    const taxaVendas = jest.fn().mockResolvedValue({});
    const metas = jest.fn().mockResolvedValue({});
    const workload = jest.fn().mockResolvedValue([]);
    const repository = {
      resumo,
      frequenciaVisitas,
      atividadeClientes,
      taxaVendas,
      metas,
      workload,
    } as unknown as DashboardRepositoryPort;
    const sut = new DashboardUseCase(repository);

    await sut.resumo();
    await sut.frequenciaVisitas();
    await sut.atividadeClientes();
    await sut.taxaVendas();
    await sut.metas();
    await sut.workload();

    expect(resumo).toHaveBeenCalledTimes(1);
    expect(frequenciaVisitas).toHaveBeenCalledTimes(1);
    expect(atividadeClientes).toHaveBeenCalledTimes(1);
    expect(taxaVendas).toHaveBeenCalledTimes(1);
    expect(metas).toHaveBeenCalledTimes(1);
    expect(workload).toHaveBeenCalledTimes(1);
  });
});
