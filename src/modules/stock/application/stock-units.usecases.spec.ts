import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateStockUnitUseCase } from './create-stock-unit.usecase';
import { UpdateStockUnitUseCase } from './update-stock-unit.usecase';
import { ListStockUnitsUseCase } from './list-stock-units.usecase';
import { StockRepositoryPort } from './ports/stock-repository.port';
import type { StockUnit } from '../domain/stock-unit';

const SAMPLE_UNIT: StockUnit = {
  id: 'u-1',
  name: 'Morada Nova',
  city: 'Morada Nova',
  status: 'ACTIVA',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('StockUnitsUseCases', () => {
  describe('CreateStockUnitUseCase', () => {
    it('crea unidad y normaliza nombre', async () => {
      const findUnitByName = jest.fn().mockResolvedValue(null);
      const saveUnit = jest.fn().mockResolvedValue(SAMPLE_UNIT);
      const repo = {
        findUnitByName,
        saveUnit,
      } as unknown as StockRepositoryPort;
      const useCase = new CreateStockUnitUseCase(repo);

      const result = await useCase.execute({
        name: '  Morada Nova  ',
        city: 'Morada Nova',
      });

      expect(findUnitByName).toHaveBeenCalledWith('Morada Nova');
      expect(saveUnit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Morada Nova', city: 'Morada Nova' }),
      );
      expect(result.id).toBe('u-1');
    });

    it('lanza 409 si la unidad ya existe', async () => {
      const findUnitByName = jest.fn().mockResolvedValue({ id: 'other' });
      const repo = {
        findUnitByName,
        saveUnit: jest.fn(),
      } as unknown as StockRepositoryPort;
      const useCase = new CreateStockUnitUseCase(repo);

      await expect(useCase.execute({ name: 'Morada Nova' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('UpdateStockUnitUseCase', () => {
    it('actualiza ciudad y status', async () => {
      const findUnitById = jest.fn().mockResolvedValue(SAMPLE_UNIT);
      const updateUnit = jest.fn().mockResolvedValue({
        ...SAMPLE_UNIT,
        status: 'INACTIVA',
      });
      const repo = {
        findUnitById,
        updateUnit,
      } as unknown as StockRepositoryPort;
      const useCase = new UpdateStockUnitUseCase(repo);

      const result = await useCase.execute('u-1', { status: 'INACTIVA' });

      expect(updateUnit).toHaveBeenCalledWith('u-1', { status: 'INACTIVA' });
      expect(result.status).toBe('INACTIVA');
    });

    it('lanza 404 si la unidad no existe', async () => {
      const repo = {
        findUnitById: jest.fn().mockResolvedValue(null),
      } as unknown as StockRepositoryPort;
      const useCase = new UpdateStockUnitUseCase(repo);

      await expect(useCase.execute('ghost', { city: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza 409 si renombra a un nombre existente', async () => {
      const findUnitById = jest.fn().mockResolvedValue(SAMPLE_UNIT);
      const findUnitByName = jest.fn().mockResolvedValue({ id: 'other' });
      const repo = {
        findUnitById,
        findUnitByName,
      } as unknown as StockRepositoryPort;
      const useCase = new UpdateStockUnitUseCase(repo);

      await expect(useCase.execute('u-1', { name: 'Otra' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('ListStockUnitsUseCase', () => {
    it('retorna lista de unidades', async () => {
      const listUnits = jest.fn().mockResolvedValue([SAMPLE_UNIT]);
      const repo = { listUnits } as unknown as StockRepositoryPort;
      const useCase = new ListStockUnitsUseCase(repo);

      const result = await useCase.execute();

      expect(listUnits).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
