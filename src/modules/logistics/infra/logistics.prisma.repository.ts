import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { Driver, Vehicle } from '../domain/logistics';
import type {
  LogisticsRepositoryPort,
  CreateDriverInput,
  UpdateDriverInput,
  CreateVehicleInput,
  UpdateVehicleInput,
} from '../application/ports/logistics-repository.port';

export const PRISMA_LOGISTICS_TOKEN = 'PRISMA_LOGISTICS_TOKEN';

interface PrismaLogisticsCrud {
  driver: {
    create: (args: { data: any }) => Promise<Driver>;
    update: (args: { where: { id: string }; data: any }) => Promise<Driver>;
    findMany: () => Promise<Driver[]>;
  };
  vehicle: {
    create: (args: { data: any }) => Promise<Vehicle>;
    update: (args: { where: { id: string }; data: any }) => Promise<Vehicle>;
    findMany: () => Promise<Vehicle[]>;
  };
}

@Injectable()
export class PrismaLogisticsRepository implements LogisticsRepositoryPort {
  constructor(
    @Inject(PRISMA_LOGISTICS_TOKEN)
    private readonly prisma: PrismaLogisticsCrud,
  ) {}

  async createDriver(data: CreateDriverInput): Promise<Driver> {
    return this.prisma.driver.create({ data: { ...data, id: uuidv4() } });
  }
  async updateDriver(id: string, data: UpdateDriverInput): Promise<Driver> {
    return this.prisma.driver.update({ where: { id }, data });
  }
  async listDrivers(): Promise<Driver[]> {
    return this.prisma.driver.findMany();
  }
  async createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
    return this.prisma.vehicle.create({ data: { ...data, id: uuidv4() } });
  }
  async updateVehicle(id: string, data: UpdateVehicleInput): Promise<Vehicle> {
    return this.prisma.vehicle.update({ where: { id }, data });
  }
  async listVehicles(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany();
  }
}
