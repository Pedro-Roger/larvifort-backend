export type DriverStatus = 'DISPONIVEL' | 'EM_ROTA' | 'INDISPONIVEL';
export type VehicleStatus = 'DISPONIVEL' | 'EM_ROTA' | 'INDISPONIVEL';

export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  document: string | null;
  status: DriverStatus;
  region: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  plate: string;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}
