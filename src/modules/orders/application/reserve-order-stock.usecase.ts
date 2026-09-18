import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Order } from '../domain/order';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import type { StockInventoryRepositoryPort } from '../../stock/application/ports/stock-inventory-repository.port';
import { STOCK_INVENTORY_REPOSITORY_PORT } from '../../stock/application/ports/stock-inventory-repository.port';

export interface ReserveStockResult {
  order: Order;
  reservedCount: number;
}

@Injectable()
export class ReserveOrderStockUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly inventory: StockInventoryRepositoryPort,
  ) {}

  async execute(
    orderId: string,
    responsibleId: string,
  ): Promise<ReserveStockResult> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }
    if (
      order.operationalStatus === 'FECHADO' ||
      order.operationalStatus === 'CANCELADO'
    ) {
      throw new BadRequestException(
        'No es posible reservar stock en un pedido cerrado o cancelado.',
      );
    }

    const missing: string[] = [];
    let reservedCount = 0;

    for (const item of order.items) {
      if (!item.productId) {
        missing.push(`${item.productName} (sin producto)`);
        continue;
      }
      const rows = await this.inventory.getAvailability({
        productId: item.productId,
      });
      const eligible = rows.find((r) => r.available >= item.quantity);

      if (!eligible) {
        missing.push(item.productName);
        continue;
      }

      const level = (await this.inventory.getLevel(
        item.productId,
        eligible.stockLocationId,
      )) ?? { quantity: 0, reserved: 0 };
      const available = level.quantity - level.reserved;

      if (available < item.quantity) {
        missing.push(item.productName);
        continue;
      }

      await this.inventory.createReservation({
        id: uuidv4(),
        productId: item.productId,
        stockLocationId: eligible.stockLocationId,
        orderId: order.id,
        quantity: item.quantity,
        responsibleId,
      });

      await this.inventory.upsertLevel(
        item.productId,
        eligible.stockLocationId,
        level.quantity,
        level.reserved + item.quantity,
      );

      reservedCount++;
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Stock disponible insuficiente: ${missing.join(', ')}. ` +
          'El pedido no avanza hasta reservar o abastecer.',
      );
    }

    const updated = await this.orders.update(orderId, {
      operationalStatus: 'ESTOQUE_RESERVADO',
    });

    return { order: updated, reservedCount };
  }
}
