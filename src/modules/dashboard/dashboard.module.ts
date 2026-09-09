import { Module } from '@nestjs/common';
import { DashboardUseCase } from './application/dashboard.use-case';
import { DASHBOARD_REPOSITORY_PORT } from './domain/dashboard.repository.port';
import { DashboardPrismaRepository } from './infra/dashboard.prisma.repository';
import { DashboardController } from './presentation/dashboard.controller';

@Module({
  providers: [
    DashboardUseCase,
    DashboardPrismaRepository,
    { provide: DASHBOARD_REPOSITORY_PORT, useClass: DashboardPrismaRepository },
  ],
  controllers: [DashboardController],
  exports: [DashboardUseCase, DASHBOARD_REPOSITORY_PORT],
})
export class DashboardModule {}
