import type { StockLocation, TipoUbicacion } from '../../domain/stock-location';
import type { StockUnit, StatusStock } from '../../domain/stock-unit';

export const STOCK_REPOSITORY_PORT = 'STOCK_REPOSITORY_PORT';

export interface CreateStockUnitData {
  name: string;
  city?: string | null;
  status?: StatusStock;
}

export interface UpdateStockUnitData {
  name?: string;
  city?: string | null;
  status?: StatusStock;
}

export interface FindStockLocationsFilter {
  unitId?: string;
  type?: TipoUbicacion;
  page?: number;
  limit?: number;
}

export interface CreateStockLocationData {
  name: string;
  unitId: string;
  type?: TipoUbicacion;
  capacity?: number | null;
  productId?: string | null;
  status?: StatusStock;
}

export interface UpdateStockLocationData {
  name?: string;
  unitId?: string;
  type?: TipoUbicacion;
  capacity?: number | null;
  productId?: string | null;
  status?: StatusStock;
}

export interface StockRepositoryPort {
  // Unidades
  saveUnit(
    data: Omit<StockUnit, 'createdAt' | 'updatedAt'>,
  ): Promise<StockUnit>;
  findUnitById(id: string): Promise<StockUnit | null>;
  findUnitByName(name: string): Promise<StockUnit | null>;
  listUnits(): Promise<StockUnit[]>;
  updateUnit(
    id: string,
    data: Partial<Omit<StockUnit, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<StockUnit>;

  // Locais / berçários
  saveLocation(
    data: Omit<StockLocation, 'createdAt' | 'updatedAt'>,
  ): Promise<StockLocation>;
  findLocationById(id: string): Promise<StockLocation | null>;
  listLocations(filter: FindStockLocationsFilter): Promise<StockLocation[]>;
  updateLocation(
    id: string,
    data: Partial<Omit<StockLocation, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<StockLocation>;
  deleteLocation(id: string): Promise<void>;
}
