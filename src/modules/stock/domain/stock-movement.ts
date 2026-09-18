export type StockMovementType = 'ENTRADA' | 'SALIDA' | 'BLOQUEO' | 'AJUSTE';

export interface StockMovement {
  id: string;
  productId: string;
  stockLocationId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  responsibleId: string | null;
  orderId: string | null;
  createdAt: Date;
}
