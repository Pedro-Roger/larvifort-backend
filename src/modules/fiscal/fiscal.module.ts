import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { FISCAL_REPOSITORY_PORT } from './application/ports/fiscal-repository.port';
import {
  PRISMA_FISCAL_TOKEN,
  PrismaFiscalRepository,
} from './infra/fiscal.prisma.repository';

import { FiscalController } from './presentation/fiscal.controller';
import { FiscalService } from './application/fiscal.service';

@Module({
  controllers: [FiscalController],
  providers: [
    FiscalService,
    { provide: PRISMA_FISCAL_TOKEN, useExisting: PrismaService },
    { provide: FISCAL_REPOSITORY_PORT, useClass: PrismaFiscalRepository },
  ],
  exports: [FISCAL_REPOSITORY_PORT],
})
export class FiscalModule {}
