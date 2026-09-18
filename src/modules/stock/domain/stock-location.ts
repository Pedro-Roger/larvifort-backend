import type { StatusStock } from './stock-unit';

export type TipoUbicacion = 'BERCARIO' | 'ALMACEN' | 'OTRO';

export interface StockLocation {
  id: string;
  name: string;
  unitId: string;
  type: TipoUbicacion;
  capacity: number | null;
  status: StatusStock;
  createdAt: Date;
  updatedAt: Date;
}
