import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { OrderRepositoryPort } from '../../orders/application/ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from '../../orders/application/ports/order-repository.port';
import type { LabWorkOrder } from '../domain/lab-work-order';
import type { LabRepositoryPort } from './ports/lab-repository.port';
import { LAB_REPOSITORY_PORT } from './ports/lab-repository.port';

export interface GenerateLabWorkOrderOptions {
  stockUnitId?: string | null;
  stockUnitName?: string | null;
  stockLocationId?: string | null;
  stockLocationName?: string | null;
  deliveryDate?: Date | null;
}

@Injectable()
export class GenerateLabWorkOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
    @Inject(LAB_REPOSITORY_PORT)
    private readonly lab: LabRepositoryPort,
  ) {}

  async execute(
    orderId: string,
    createdById: string,
    options: GenerateLabWorkOrderOptions = {},
  ): Promise<LabWorkOrder[]> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }
    if (order.operationalStatus !== 'FECHADO') {
      throw new BadRequestException(
        'Solo es posible generar una OS de laboratorio para un pedido cerrado.',
      );
    }
    if (await this.lab.hasActiveForOrder(orderId)) {
      throw new BadRequestException(
        'El pedido ya posee una orden de servicio de laboratorio activa.',
      );
    }

    const productItems = order.items.filter((i) => !i.deletedAt && i.productId);
    if (productItems.length === 0) {
      throw new BadRequestException(
        'El pedido no posee ítems de producto para generar la OS de laboratorio.',
      );
    }

    const clientName = order.clientName ?? null;
    const deliveryDate =
      options.deliveryDate !== undefined
        ? options.deliveryDate
        : order.deliveryDate;

    const created: LabWorkOrder[] = [];
    for (const item of productItems) {
      created.push(
        await this.lab.create({
          id: uuidv4(),
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientName,
          productId: item.productId ?? null,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit || 'MILHEIRO',
          stockUnitId: options.stockUnitId ?? null,
          stockUnitName: options.stockUnitName ?? null,
          stockLocationId: options.stockLocationId ?? null,
          stockLocationName: options.stockLocationName ?? null,
          deliveryDate,
          createdById,
        }),
      );
    }

    return created;
  }
}
