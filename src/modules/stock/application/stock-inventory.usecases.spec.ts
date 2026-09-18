import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetAvailabilityUseCase } from './get-availability.usecase';
import { ListMovementsUseCase } from './list-movements.usecase';
import { RegisterMovementUseCase } from './register-movement.usecase';
import { CreateReservationUseCase } from './create-reservation.usecase';
import { CancelReservationUseCase } from './cancel-reservation.usecase';
import { StockInventoryRepositoryPort } from './ports/stock-inventory-repository.port';

const PRODUCT = {
  id: 'p-1',
  code: 'POS-LARVA',
  name: 'Pós-larva',
  isActive: true,
};
const LOCATION = {
  id: 'l-1',
  name: 'Berçário Norte',
  unitId: 'u-1',
  type: 'BERCARIO',
  status: 'ACTIVA',
};

describe('StockInventoryUseCases', () => {
  describe('GetAvailabilityUseCase', () => {
    it('delega filtro al repositorio', async () => {
      const getAvailability = jest.fn().mockResolvedValue([
        {
          productId: 'p-1',
          stockLocationId: 'l-1',
          unitId: 'u-1',
          quantity: 100,
          reserved: 20,
          available: 80,
        },
      ]);
      const useCase = new GetAvailabilityUseCase({
        getAvailability,
      } as unknown as StockInventoryRepositoryPort);

      const result = await useCase.execute({ productId: 'p-1' });

      expect(getAvailability).toHaveBeenCalledWith({ productId: 'p-1' });
      expect(result[0].available).toBe(80);
    });
  });

  describe('ListMovementsUseCase', () => {
    it('aplica paginación por defecto', async () => {
      const listMovements = jest.fn().mockResolvedValue([]);
      const useCase = new ListMovementsUseCase({
        listMovements,
      } as unknown as StockInventoryRepositoryPort);

      await useCase.execute({ productId: 'p-1' });

      expect(listMovements).toHaveBeenCalledWith({
        productId: 'p-1',
        page: 1,
        limit: 20,
      });
    });
  });

  describe('RegisterMovementUseCase', () => {
    it('registra ENTRADA y suma cantidad', async () => {
      const getLevel = jest
        .fn()
        .mockResolvedValue({ quantity: 100, reserved: 10 });
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const registerMovement = jest.fn().mockResolvedValue({
        id: 'm-1',
        type: 'ENTRADA',
      });
      const inventory = {
        getLevel,
        upsertLevel,
        registerMovement,
      } as unknown as StockInventoryRepositoryPort;
      const products = { findById: jest.fn().mockResolvedValue(PRODUCT) };
      const stock = { findLocationById: jest.fn().mockResolvedValue(LOCATION) };
      const useCase = new RegisterMovementUseCase(
        inventory,
        products as never,
        stock as never,
      );

      const result = await useCase.execute({
        productId: 'p-1',
        stockLocationId: 'l-1',
        type: 'ENTRADA',
        quantity: 50,
        reason: 'Compra',
      });

      expect(upsertLevel).toHaveBeenCalledWith('p-1', 'l-1', 150, 10);
      expect(result.id).toBe('m-1');
    });

    it('rechaza SALIDA mayor al stock físico (400)', async () => {
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const inventory = {
        getLevel: jest.fn().mockResolvedValue({ quantity: 10, reserved: 0 }),
        upsertLevel,
      } as unknown as StockInventoryRepositoryPort;
      const products = { findById: jest.fn().mockResolvedValue(PRODUCT) };
      const stock = { findLocationById: jest.fn().mockResolvedValue(LOCATION) };
      const useCase = new RegisterMovementUseCase(
        inventory,
        products as never,
        stock as never,
      );

      await expect(
        useCase.execute({
          productId: 'p-1',
          stockLocationId: 'l-1',
          type: 'SALIDA',
          quantity: 20,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(upsertLevel).not.toHaveBeenCalled();
    });

    it('lanza 404 si el local no existe', async () => {
      const inventory = {} as unknown as StockInventoryRepositoryPort;
      const products = { findById: jest.fn().mockResolvedValue(PRODUCT) };
      const stock = { findLocationById: jest.fn().mockResolvedValue(null) };
      const useCase = new RegisterMovementUseCase(
        inventory,
        products as never,
        stock as never,
      );

      await expect(
        useCase.execute({
          productId: 'p-1',
          stockLocationId: 'ghost',
          type: 'ENTRADA',
          quantity: 5,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('CreateReservationUseCase', () => {
    it('reserva dentro del disponible', async () => {
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const createReservation = jest.fn().mockResolvedValue({
        id: 'r-1',
        quantity: 30,
        orderId: null,
      });
      const inventory = {
        getLevel: jest.fn().mockResolvedValue({ quantity: 100, reserved: 0 }),
        upsertLevel,
        createReservation,
      } as unknown as StockInventoryRepositoryPort;
      const products = { findById: jest.fn().mockResolvedValue(PRODUCT) };
      const stock = { findLocationById: jest.fn().mockResolvedValue(LOCATION) };
      const useCase = new CreateReservationUseCase(
        inventory,
        products as never,
        stock as never,
      );

      const result = await useCase.execute({
        productId: 'p-1',
        stockLocationId: 'l-1',
        quantity: 30,
      });

      expect(upsertLevel).toHaveBeenCalledWith('p-1', 'l-1', 100, 30);
      expect(result.id).toBe('r-1');
    });

    it('rechaza reservar por encima del disponible (400)', async () => {
      const createReservation = jest.fn().mockResolvedValue(undefined);
      const inventory = {
        getLevel: jest.fn().mockResolvedValue({ quantity: 100, reserved: 90 }),
        createReservation,
      } as unknown as StockInventoryRepositoryPort;
      const products = { findById: jest.fn().mockResolvedValue(PRODUCT) };
      const stock = { findLocationById: jest.fn().mockResolvedValue(LOCATION) };
      const useCase = new CreateReservationUseCase(
        inventory,
        products as never,
        stock as never,
      );

      await expect(
        useCase.execute({
          productId: 'p-1',
          stockLocationId: 'l-1',
          quantity: 20,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(createReservation).not.toHaveBeenCalled();
    });
  });

  describe('CancelReservationUseCase', () => {
    it('cancela reserva activa y devuelve disponibilidad', async () => {
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const cancelReservation = jest.fn().mockResolvedValue({
        id: 'r-1',
        status: 'CANCELADA',
      });
      const inventory = {
        findReservationById: jest.fn().mockResolvedValue({
          id: 'r-1',
          productId: 'p-1',
          stockLocationId: 'l-1',
          quantity: 30,
          status: 'ACTIVA',
        }),
        getLevel: jest.fn().mockResolvedValue({ quantity: 100, reserved: 30 }),
        upsertLevel,
        cancelReservation,
      } as unknown as StockInventoryRepositoryPort;
      const useCase = new CancelReservationUseCase(inventory);

      const result = await useCase.execute('r-1');

      expect(upsertLevel).toHaveBeenCalledWith('p-1', 'l-1', 100, 0);
      expect(result.status).toBe('CANCELADA');
    });

    it('lanza 400 si la reserva ya no está activa', async () => {
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const inventory = {
        findReservationById: jest.fn().mockResolvedValue({
          id: 'r-1',
          productId: 'p-1',
          stockLocationId: 'l-1',
          quantity: 10,
          status: 'CANCELADA',
        }),
        upsertLevel,
      } as unknown as StockInventoryRepositoryPort;
      const useCase = new CancelReservationUseCase(inventory);

      await expect(useCase.execute('r-1')).rejects.toThrow(BadRequestException);
      expect(upsertLevel).not.toHaveBeenCalled();
    });

    it('lanza 404 si la reserva no existe', async () => {
      const findReservationById = jest.fn().mockResolvedValue(null);
      const useCase = new CancelReservationUseCase({
        findReservationById,
      } as unknown as StockInventoryRepositoryPort);

      await expect(useCase.execute('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
