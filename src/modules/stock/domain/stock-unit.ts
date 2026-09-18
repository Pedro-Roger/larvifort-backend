export type StatusStock = 'ACTIVA' | 'INACTIVA';

export interface StockUnit {
  id: string;
  name: string;
  city: string | null;
  status: StatusStock;
  createdAt: Date;
  updatedAt: Date;
}
