import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockReservation } from '../domain/stock-reservation';
import {
  STOCK_INVENTORY_REPOSITORY_PORT,
  StockInventoryRepositoryPort,
} from './ports/stock-inventory-repository.port';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject(STOCK_INVENTORY_REPOSITORY_PORT)
    private readonly inventory: StockInventoryRepositoryPort,
  ) {}

  async execute(id: string): Promise<StockReservation> {
    const reservation = await this.inventory.findReservationById(id);
    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    if (reservation.status !== 'ACTIVA') {
      throw new BadRequestException(
        'Solo se pueden cancelar reservas activas.',
      );
    }

    const level = (await this.inventory.getLevel(
      reservation.productId,
      reservation.stockLocationId,
    )) ?? { quantity: 0, reserved: 0 };

    const nextReserved = Math.max(0, level.reserved - reservation.quantity);

    await this.inventory.upsertLevel(
      reservation.productId,
      reservation.stockLocationId,
      level.quantity,
      nextReserved,
    );

    return this.inventory.cancelReservation(id);
  }
}
