import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockLocation } from '../domain/stock-location';
import {
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
  UpdateStockLocationData,
} from './ports/stock-repository.port';

@Injectable()
export class UpdateStockLocationUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repo: StockRepositoryPort,
  ) {}

  async execute(
    id: string,
    data: UpdateStockLocationData,
  ): Promise<StockLocation> {
    const existing = await this.repo.findLocationById(id);
    if (!existing) {
      throw new NotFoundException('Local não encontrado.');
    }

    if (data.unitId !== undefined && data.unitId.trim() !== existing.unitId) {
      const unit = await this.repo.findUnitById(data.unitId.trim());
      if (!unit) {
        throw new NotFoundException('Unidade de destino não encontrada.');
      }
    }

    if (
      data.capacity !== undefined &&
      data.capacity !== null &&
      data.capacity <= 0
    ) {
      throw new BadRequestException('Capacidade deve ser maior que zero.');
    }

    return this.repo.updateLocation(id, {
      name: data.name?.trim(),
      unitId: data.unitId?.trim(),
      type: data.type,
      capacity: data.capacity,
      status: data.status,
    });
  }
}
