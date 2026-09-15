import { Module } from '@nestjs/common';
import { MetricsController } from './presentation/metrics.controller';
import { MetricsUseCases } from './application/metrics.usecases';
import { METRICS_REPOSITORY } from './application/metrics.repository';
import { MetricsPrismaRepository } from './infra/metrics.prisma.repository';
@Module({
  controllers: [MetricsController],
  providers: [
    MetricsUseCases,
    { provide: METRICS_REPOSITORY, useClass: MetricsPrismaRepository },
  ],
})
export class MetricsModule {}
