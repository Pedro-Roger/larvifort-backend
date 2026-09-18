import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockMovement } from '../domain/stock-movement';
import {
  RegisterMovementData,
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

@Injectable()
export class RegisterMovementUseCase {
  constructor(
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly inventory: StockInventoryRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly products: ProductRepositoryPort,
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly stock: StockRepositoryPort,
  ) {}

  async execute(
    data: Omit<RegisterMovementData, 'id'>,
  ): Promise<StockMovement> {
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

    let nextQuantity: number;
    switch (data.type) {
      case 'ENTRADA':
        nextQuantity = level.quantity + data.quantity;
        break;
      case 'SALIDA':
      case 'BLOQUEO':
        if (data.quantity > level.quantity) {
          throw new BadRequestException(
            'Stock físico insuficiente para esta operación.',
          );
        }
        nextQuantity = level.quantity - data.quantity;
        break;
      case 'AJUSTE':
        nextQuantity = data.quantity;
        break;
      default:
        throw new BadRequestException('Tipo de movimiento inválido.');
    }

    await this.inventory.upsertLevel(
      product.id,
      location.id,
      nextQuantity,
      level.reserved,
    );

    return this.inventory.registerMovement({
      id: uuidv4(),
      productId: product.id,
      stockLocationId: location.id,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason ?? null,
      responsibleId: data.responsibleId ?? null,
      orderId: data.orderId ?? null,
    });
  }
}
