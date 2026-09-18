import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import { ORDER_REPOSITORY_PORT } from './ports/order-repository.port';
import type { AvailabilityRow } from '../../stock/domain/availability';
import type { StockInventoryRepositoryPort } from '../../stock/application/ports/stock-inventory-repository.port';
import { STOCK_INVENTORY_REPOSITORY_PORT } from '../../stock/application/ports/stock-inventory-repository.port';

export interface StockOption {
  unitId: string;
  unitName: string;
  stockLocationId: string;
  locationName: string;
  available: number;
}

export interface OrderStockOptionsItem {
  productId: string | null;
  productName: string;
  unit: string;
  quantity: number;
  options: StockOption[];
  attended: boolean;
}

export interface OrderStockOptions {
  orderId: string;
  orderNumber: string | null;
  items: OrderStockOptionsItem[];
  anyShortage: boolean;
}

function toOption(row: AvailabilityRow): StockOption {
  return {
    unitId: row.unitId,
    unitName: row.unitName,
    stockLocationId: row.stockLocationId,
    locationName: row.locationName,
    available: row.available,
  };
}

@Injectable()
export class GetOrderStockOptionsUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_PORT)
    private readonly orders: OrderRepositoryPort,
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly inventory: StockInventoryRepositoryPort,
  ) {}

  async execute(orderId: string): Promise<OrderStockOptions> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    const lists = await Promise.all(
      order.items.map((item) =>
        item.productId
          ? this.inventory.getAvailability({ productId: item.productId })
          : Promise.resolve([]),
      ),
    );

    let anyShortage = false;
    const items: OrderStockOptionsItem[] = order.items.map((item, i) => {
      const rows = lists[i];
      const options = rows
        .filter((r) => r.available >= item.quantity)
        .map(toOption);

      if (options.length === 0) anyShortage = true;

      return {
        productId: item.productId ?? null,
        productName: item.productName,
        unit: item.unit,
        quantity: item.quantity,
        options,
        attended: options.length > 0,
      };
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      items,
      anyShortage,
    };
  }
}
