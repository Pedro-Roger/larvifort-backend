import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockUnit } from '../domain/stock-unit';
import {
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
  UpdateStockUnitData,
} from './ports/stock-repository.port';

@Injectable()
export class UpdateStockUnitUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repo: StockRepositoryPort,
  ) {}

  async execute(id: string, data: UpdateStockUnitData): Promise<StockUnit> {
    const existing = await this.repo.findUnitById(id);
    if (!existing) {
      throw new NotFoundException('Unidade não encontrada.');
    }

    if (data.name !== undefined && data.name.trim() !== existing.name) {
      const byName = await this.repo.findUnitByName(data.name.trim());
      if (byName && byName.id !== id) {
        throw new ConflictException('Já existe uma unidade com esse nome.');
      }
    }

    return this.repo.updateUnit(id, {
      name: data.name?.trim(),
      city: data.city !== undefined ? data.city?.trim() || null : undefined,
      status: data.status,
    });
  }
}
