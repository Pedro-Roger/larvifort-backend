export type StockReservationStatus = 'ACTIVA' | 'CANCELADA' | 'CONSUMIDA';

export interface StockReservation {
  id: string;
  productId: string;
  stockLocationId: string;
  orderId: string | null;
  quantity: number;
  status: StockReservationStatus;
  responsibleId: string | null;
  createdAt: Date;
  cancelledAt: Date | null;
}

export interface StockReservationListItem extends StockReservation {
  orderNumber: string | null;
  productName: string;
  unit: string;
  unitName: string;
  locationName: string;
}
