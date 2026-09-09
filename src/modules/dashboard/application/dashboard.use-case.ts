import { Inject, Injectable } from '@nestjs/common';
import type { DashboardRepositoryPort } from '../domain/dashboard.repository.port';
import { DASHBOARD_REPOSITORY_PORT } from '../domain/dashboard.repository.port';

@Injectable()
export class DashboardUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY_PORT)
    private readonly dashboardRepository: DashboardRepositoryPort,
  ) {}

  async resumo() {
    return this.dashboardRepository.resumo();
  }

  async frequenciaVisitas() {
    return this.dashboardRepository.frequenciaVisitas();
  }

  async atividadeClientes() {
    return this.dashboardRepository.atividadeClientes();
  }

  async taxaVendas() {
    return this.dashboardRepository.taxaVendas();
  }

  async metas() {
    return this.dashboardRepository.metas();
  }

  async workload() {
    return this.dashboardRepository.workload();
  }
}
