import { Inject, Injectable } from '@nestjs/common';
import { StockUnit } from '../domain/stock-unit';
import {
  STOCK_REPOSITORY_PORT,
  StockRepositoryPort,
} from './ports/stock-repository.port';

@Injectable()
export class ListStockUnitsUseCase {
  constructor(
    @Inject(STOCK_REPOSITORY_PORT)
    private readonly repo: StockRepositoryPort,
  ) {}

  async execute(): Promise<StockUnit[]> {
    return this.repo.listUnits();
  }
}
