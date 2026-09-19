import type { StatusStock } from './stock-unit';

export type TipoUbicacion = 'BERCARIO' | 'ALMACEN' | 'OTRO';

export interface StockLocation {
  id: string;
  name: string;
  unitId: string;
  type: TipoUbicacion;
  capacity: number | null;
  productId: string | null;
  status: StatusStock;
  createdAt: Date;
  updatedAt: Date;
}
