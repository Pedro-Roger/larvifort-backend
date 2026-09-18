import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockLocation } from '../domain/stock-location';
import {
  CreateStockLocationData,
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from './ports/stock-repository.port';

@Injectable()
export class CreateStockLocationUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repo: StockRepositoryPort,
  ) {}

  async execute(data: CreateStockLocationData): Promise<StockLocation> {
    const unit = await this.repo.findUnitById(data.unitId.trim());
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada.');
    }

    if (
      data.capacity !== undefined &&
      data.capacity !== null &&
      data.capacity <= 0
    ) {
      throw new BadRequestException('Capacidade deve ser maior que zero.');
    }

    return this.repo.saveLocation({
      id: uuidv4(),
      name: data.name.trim(),
      unitId: unit.id,
      type: data.type ?? 'BERCARIO',
      capacity: data.capacity ?? null,
      status: data.status ?? 'ACTIVA',
    });
  }
}
