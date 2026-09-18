import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockReservation } from '../domain/stock-reservation';
import {
  STOCK_INVENTORY_REPOSITORY_PORT,
  StockInventoryRepositoryPort,
} from './ports/stock-inventory-repository.port';
import {
  PRODUCT_REPOSITORY_PORT,
  ProductRepositoryPort,
} from '../../products/application/ports/product-repository.port';
import {
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from './ports/stock-repository.port';

export interface CreateReservationInput {
  productId: string;
  stockLocationId: string;
  orderId?: string | null;
  quantity: number;
  responsibleId?: string | null;
}

@Injectable()
export class CreateReservationUseCase {
  constructor(
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly inventory: StockInventoryRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly products: ProductRepositoryPort,
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stock: StockRepositoryPort,
  ) {}

  async execute(data: CreateReservationInput): Promise<StockReservation> {
    const product = await this.products.findById(data.productId.trim());
    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const location = await this.stock.findLocationById(
      data.stockLocationId.trim(),
    );
    if (!location) {
      throw new NotFoundException('Local no encontrado.');
    }

    if (data.quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que cero.');
    }

    const level = (await this.inventory.getLevel(product.id, location.id)) ?? {
      quantity: 0,
      reserved: 0,
    };
    const available = level.quantity - level.reserved;

    if (data.quantity > available) {
      throw new BadRequestException(
        'Stock disponible insuficiente para la reserva.',
      );
    }

    const reservation = await this.inventory.createReservation({
      id: uuidv4(),
      productId: product.id,
      stockLocationId: location.id,
      orderId: data.orderId ?? null,
      quantity: data.quantity,
      responsibleId: data.responsibleId ?? null,
    });

    await this.inventory.upsertLevel(
      product.id,
      location.id,
      level.quantity,
      level.reserved + data.quantity,
    );

    return reservation;
  }
}
