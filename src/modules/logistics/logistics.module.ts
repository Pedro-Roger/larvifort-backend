import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateDriverUseCase } from './application/create-driver.usecase';
import { LOGISTICS_REPOSITORY_PORT } from './application/ports/logistics-repository.port';
import {
  PRISMA_LOGISTICS_TOKEN,
  PrismaLogisticsRepository,
} from './infra/logistics.prisma.repository';

@Module({
  providers: [
    CreateDriverUseCase,
    PrismaLogisticsRepository,
    { provide: PRISMA_LOGISTICS_TOKEN, useExisting: PrismaService },
    { provide: LOGISTICS_REPOSITORY_PORT, useClass: PrismaLogisticsRepository },
  ],
})
export class LogisticsModule {}
