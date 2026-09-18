import { Module } from '@nestjs/common';
import { MetricsController } from './presentation/metrics.controller';
import { MetricsUseCases } from './application/metrics.usecases';
import { METRICS_REPOSITORY } from './application/metrics.repository';
import { MetricsPrismaRepository } from './infra/metrics.prisma.repository';
import { OperationalMetricsService } from './application/operational-metrics.service';
@Module({
  controllers: [MetricsController],
  providers: [
    MetricsUseCases,
    { provide: METRICS_REPOSITORY, useClass: MetricsPrismaRepository },
    OperationalMetricsService,
  ],
})
export class MetricsModule {}
