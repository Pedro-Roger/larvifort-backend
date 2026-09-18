import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StockUnit } from '../domain/stock-unit';
import {
  CreateStockUnitData,
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from './ports/stock-repository.port';

@Injectable()
export class CreateStockUnitUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repo: StockRepositoryPort,
  ) {}

  async execute(data: CreateStockUnitData): Promise<StockUnit> {
    const name = data.name.trim();
    const existing = await this.repo.findUnitByName(name);
    if (existing) {
      throw new ConflictException(`Já existe uma unidade com nome ${name}.`);
    }

    return this.repo.saveUnit({
      id: uuidv4(),
      name,
      city: data.city?.trim() || null,
      status: data.status ?? 'ACTIVA',
    });
  }
}
