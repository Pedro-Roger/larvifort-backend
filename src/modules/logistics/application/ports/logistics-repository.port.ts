import type {
  Driver,
  Vehicle,
  DriverStatus,
  VehicleStatus,
} from '../../domain/logistics';

export const LOGISTICS_REPOSITORY_PORT = 'LOGISTICS_REPOSITORY_PORT';

export interface CreateDriverInput {
  name: string;
  phone?: string | null;
  document?: string | null;
  region?: string | null;
}

export interface DriverRow {
  // Internal prisma type
  id: string;
  name: string;
  phone: string | null;
  document: string | null;
  status: string;
  region: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDriverInput {
  name?: string;
  phone?: string | null;
  document?: string | null;
  status?: DriverStatus;
  region?: string | null;
}

export interface CreateVehicleInput {
  plate: string;
}

export interface UpdateVehicleInput {
  plate?: string;
  status?: VehicleStatus;
}

export interface LogisticsRepositoryPort {
  createDriver(data: CreateDriverInput): Promise<Driver>;
  updateDriver(id: string, data: UpdateDriverInput): Promise<Driver>;
  listDrivers(): Promise<Driver[]>;
  createVehicle(data: CreateVehicleInput): Promise<Vehicle>;
  updateVehicle(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  listVehicles(): Promise<Vehicle[]>;
}
