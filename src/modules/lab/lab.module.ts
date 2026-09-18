import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { OrdersModule } from '../orders/orders.module';
import { GenerateLabWorkOrderUseCase } from './application/generate-lab-work-order.usecase';
import { UpdateLabWorkOrderStatusUseCase } from './application/update-lab-work-order-status.usecase';
import { ListLabOrdersUseCase } from './application/list-lab-orders.usecase';
import { GetLabWorkOrderUseCase } from './application/get-lab-work-order.usecase';
import { LAB_REPOSITORY_PORT } from './application/ports/lab-repository.port';
import {
  PRISMA_LAB_TOKEN,
  PrismaLabRepository,
} from './infra/lab.prisma.repository';
import { LabController } from './presentation/lab.controller';

@Module({
  imports: [OrdersModule],
  controllers: [LabController],
  providers: [
    GenerateLabWorkOrderUseCase,
    UpdateLabWorkOrderStatusUseCase,
    ListLabOrdersUseCase,
    GetLabWorkOrderUseCase,
    PrismaLabRepository,
    { provide: PRISMA_LAB_TOKEN, useExisting: PrismaService },
    { provide: LAB_REPOSITORY_PORT, useClass: PrismaLabRepository },
  ],
  exports: [LAB_REPOSITORY_PORT],
})
export class LabModule {}
