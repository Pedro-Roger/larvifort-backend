import type { AvailabilityRow } from '../../domain/availability';
import type {
  StockMovement,
  StockMovementType,
} from '../../domain/stock-movement';
import type {
  StockReservation,
  StockReservationListItem,
  StockReservationStatus,
} from '../../domain/stock-reservation';

export const STOCK_INVENTORY_REPOSITORY_PORT =
  'STOCK_INVENTORY_REPOSITORY_PORT';

export interface AvailabilityFilter {
  productId?: string;
  unitId?: string;
  locationId?: string;
}

export interface RegisterMovementData {
  id: string;
  productId: string;
  stockLocationId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  responsibleId?: string | null;
  orderId?: string | null;
}

export interface FindMovementsFilter {
  productId?: string;
  locationId?: string;
  orderId?: string;
  type?: StockMovementType;
  page?: number;
  limit?: number;
}

export interface ReservationFilter {
  productId?: string;
  orderId?: string;
  status?: StockReservationStatus;
  page?: number;
  limit?: number;
}

export interface StockInventoryRepositoryPort {
  getAvailability(filter: AvailabilityFilter): Promise<AvailabilityRow[]>;
  getLevel(
    productId: string,
    stockLocationId: string,
  ): Promise<{
    quantity: number;
    reserved: number;
  } | null>;
  upsertLevel(
    productId: string,
    stockLocationId: string,
    quantity: number,
    reserved: number,
  ): Promise<void>;
  registerMovement(data: RegisterMovementData): Promise<StockMovement>;
  listMovements(filter: FindMovementsFilter): Promise<StockMovement[]>;
  createReservation(data: {
    id: string;
    productId: string;
    stockLocationId: string;
    orderId?: string | null;
    quantity: number;
    responsibleId?: string | null;
  }): Promise<StockReservation>;
  findReservationById(id: string): Promise<StockReservation | null>;
  cancelReservation(id: string): Promise<StockReservation>;
  listReservations(
    filter: ReservationFilter,
  ): Promise<StockReservationListItem[]>;
}
