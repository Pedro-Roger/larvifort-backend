import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import type { StockInventoryRepositoryPort } from '../../stock/application/ports/stock-inventory-repository.port';
import { STOCK_INVENTORY_REPOSITORY_PORT } from '../../stock/application/ports/stock-inventory-repository.port';

export interface ReleaseStockResult {
  order: Order;
  releasedCount: number;
}

@Injectable()
export class ReleaseOrderStockUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly inventory: StockInventoryRepositoryPort,
  ) {}

  async execute(orderId: string): Promise<ReleaseStockResult> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    const reservations = await this.inventory.listReservations({
      orderId,
      status: 'ACTIVA',
    });

    for (const res of reservations) {
      const level = (await this.inventory.getLevel(
        res.productId,
        res.stockLocationId,
      )) ?? { quantity: 0, reserved: 0 };

      const nextReserved = Math.max(0, level.reserved - res.quantity);
      await this.inventory.upsertLevel(
        res.productId,
        res.stockLocationId,
        level.quantity,
        nextReserved,
      );
      await this.inventory.cancelReservation(res.id);
    }

    const updated = await this.orders.update(orderId, {
      operationalStatus: 'AGUARDANDO_ESTOQUE',
    });

    return { order: updated, releasedCount: reservations.length };
  }
}
