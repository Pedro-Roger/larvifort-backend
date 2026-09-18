import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateStockLocationUseCase } from './create-stock-location.usecase';
import { UpdateStockLocationUseCase } from './update-stock-location.usecase';
import { ListStockLocationsUseCase } from './list-stock-locations.usecase';
import { StockRepositoryPort } from './ports/stock-repository.port';
import type { StockLocation } from '../domain/stock-location';

const SAMPLE_LOCATION: StockLocation = {
  id: 'l-1',
  name: 'Berçário Norte',
  unitId: 'u-1',
  type: 'BERCARIO',
  capacity: 5000,
  status: 'ACTIVA',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('StockLocationsUseCases', () => {
  describe('CreateStockLocationUseCase', () => {
    it('crea local vinculado a unidad existente', async () => {
      const findUnitById = jest
        .fn()
        .mockResolvedValue({ id: 'u-1', name: 'Morada Nova' });
      const saveLocation = jest.fn().mockResolvedValue(SAMPLE_LOCATION);
      const repo = {
        findUnitById,
        saveLocation,
      } as unknown as StockRepositoryPort;
      const useCase = new CreateStockLocationUseCase(repo);

      const result = await useCase.execute({
        name: 'Berçário Norte',
        unitId: 'u-1',
        type: 'BERCARIO',
        capacity: 5000,
      });

      expect(findUnitById).toHaveBeenCalledWith('u-1');
      expect(saveLocation).toHaveBeenCalled();
      expect(result.type).toBe('BERCARIO');
    });

    it('lanza 404 si la unidad no existe', async () => {
      const repo = {
        findUnitById: jest.fn().mockResolvedValue(null),
      } as unknown as StockRepositoryPort;
      const useCase = new CreateStockLocationUseCase(repo);

      await expect(
        useCase.execute({ name: 'X', unitId: 'ghost' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza 400 con capacidad no positiva', async () => {
      const findUnitById = jest.fn().mockResolvedValue({ id: 'u-1' });
      const repo = { findUnitById } as unknown as StockRepositoryPort;
      const useCase = new CreateStockLocationUseCase(repo);

      await expect(
        useCase.execute({ name: 'X', unitId: 'u-1', capacity: -5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UpdateStockLocationUseCase', () => {
    it('actualiza un local', async () => {
      const findLocationById = jest.fn().mockResolvedValue(SAMPLE_LOCATION);
      const updateLocation = jest.fn().mockResolvedValue({
        ...SAMPLE_LOCATION,
        capacity: 6000,
      });
      const repo = {
        findLocationById,
        updateLocation,
      } as unknown as StockRepositoryPort;
      const useCase = new UpdateStockLocationUseCase(repo);

      const result = await useCase.execute('l-1', { capacity: 6000 });

      expect(updateLocation).toHaveBeenCalledWith('l-1', { capacity: 6000 });
      expect(result.capacity).toBe(6000);
    });

    it('lanza 404 si el local no existe', async () => {
      const repo = {
        findLocationById: jest.fn().mockResolvedValue(null),
      } as unknown as StockRepositoryPort;
      const useCase = new UpdateStockLocationUseCase(repo);

      await expect(useCase.execute('ghost', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza 404 al mover a unidad inexistente', async () => {
      const findLocationById = jest.fn().mockResolvedValue(SAMPLE_LOCATION);
      const findUnitById = jest.fn().mockResolvedValue(null);
      const repo = {
        findLocationById,
        findUnitById,
      } as unknown as StockRepositoryPort;
      const useCase = new UpdateStockLocationUseCase(repo);

      await expect(useCase.execute('l-1', { unitId: 'ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('ListStockLocationsUseCase', () => {
    it('lista y aplica paginación por defecto', async () => {
      const listLocations = jest.fn().mockResolvedValue([SAMPLE_LOCATION]);
      const repo = { listLocations } as unknown as StockRepositoryPort;
      const useCase = new ListStockLocationsUseCase(repo);

      const result = await useCase.execute({ unitId: 'u-1', type: 'BERCARIO' });

      expect(listLocations).toHaveBeenCalledWith({
        unitId: 'u-1',
        type: 'BERCARIO',
        page: 1,
        limit: 20,
      });
      expect(result).toHaveLength(1);
    });
  });
});
