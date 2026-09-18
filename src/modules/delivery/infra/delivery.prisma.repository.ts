import { Inject, Injectable } from '@nestjs/common';
import type { Delivery } from '../domain/delivery';
import type {
  DeliveryRepositoryPort,
  CreateDeliveryInput,
  UpdateDeliveryInput,
} from '../application/ports/delivery-repository.port';

export const PRISMA_DELIVERY_TOKEN = 'PRISMA_DELIVERY_TOKEN';

interface PrismaDeliveryCrud {
  delivery: {
    findUnique(args: { where: { orderId: string } }): Promise<Delivery | null>;
    create(args: { data: CreateDeliveryInput }): Promise<Delivery>;
    update(args: {
      where: { orderId: string };
      data: UpdateDeliveryInput;
    }): Promise<Delivery>;
  };
}

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @Inject(PRISMA_DELIVERY_TOKEN)
    private readonly prisma: PrismaDeliveryCrud,
  ) {}

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    return this.prisma.delivery.findUnique({ where: { orderId } });
  }

  async create(data: CreateDeliveryInput): Promise<Delivery> {
    return this.prisma.delivery.create({ data });
  }

  async update(orderId: string, data: UpdateDeliveryInput): Promise<Delivery> {
    return this.prisma.delivery.update({ where: { orderId }, data });
  }
}
