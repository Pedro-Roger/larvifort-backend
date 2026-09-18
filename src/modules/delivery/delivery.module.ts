import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { DeliveryService } from './application/delivery.service';
import { DELIVERY_REPOSITORY_PORT } from './application/ports/delivery-repository.port';
import {
  PRISMA_DELIVERY_TOKEN,
  PrismaDeliveryRepository,
} from './infra/delivery.prisma.repository';
import { DeliveryController } from './presentation/delivery.controller';

@Module({
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    PrismaDeliveryRepository,
    { provide: PRISMA_DELIVERY_TOKEN, useExisting: PrismaService },
    { provide: DELIVERY_REPOSITORY_PORT, useClass: PrismaDeliveryRepository },
  ],
})
export class DeliveryModule {}
