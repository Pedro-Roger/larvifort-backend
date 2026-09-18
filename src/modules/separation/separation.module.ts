import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { OrdersModule } from '../orders/orders.module';
import { StartSeparationUseCase } from './application/start-separation.usecase';
import { CompleteSeparationUseCase } from './application/complete-separation.usecase';
import { ReportSeparationDivergenceUseCase } from './application/report-separation-divergence.usecase';
import { SEPARATION_REPOSITORY_PORT } from './application/ports/separation-repository.port';
import {
  PRISMA_SEPARATION_TOKEN,
  PrismaSeparationRepository,
} from './infra/separation.prisma.repository';
import { SeparationController } from './presentation/separation.controller';

@Module({
  imports: [OrdersModule],
  controllers: [SeparationController],
  providers: [
    StartSeparationUseCase,
    CompleteSeparationUseCase,
    ReportSeparationDivergenceUseCase,
    PrismaSeparationRepository,
    { provide: PRISMA_SEPARATION_TOKEN, useExisting: PrismaService },
    {
      provide: SEPARATION_REPOSITORY_PORT,
      useClass: PrismaSeparationRepository,
    },
  ],
})
export class SeparationModule {}
