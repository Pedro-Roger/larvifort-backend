// Fila de disponibilidad derivada: disponible = quantity - reserved.
export interface AvailabilityRow {
  productId: string;
  stockLocationId: string;
  unitId: string;
  unitName: string;
  locationName: string;
  quantity: number;
  reserved: number;
  available: number;
}
