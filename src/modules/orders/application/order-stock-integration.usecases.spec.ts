import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetOrderStockOptionsUseCase } from './get-order-stock-options.usecase';
import { ReserveOrderStockUseCase } from './reserve-order-stock.usecase';
import { ReleaseOrderStockUseCase } from './release-order-stock.usecase';
import { OrderRepositoryPort } from './ports/order-repository.port';
import type { StockInventoryRepositoryPort } from '../../stock/application/ports/stock-inventory-repository.port';
import type { Order } from '../domain/order';

function baseOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    operationalStatus: 'AGUARDANDO_ESTOQUE',
    clientId: 'client-1',
    subtotal: 500,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 500,
    paymentMethod: 'PIX',
    deliveryDate: new Date('2026-09-22T10:00:00.000Z'),
    shippingAddress: { city: 'Rifaina' },
    orderDate: new Date(),
    items: [
      {
        id: 'i-1',
        orderId: 'order-1',
        productId: 'p-1',
        productName: 'Pós-larva',
        unit: 'MILHEIRO',
        quantity: 10,
        unitPrice: 50,
        discount: 0,
        totalPrice: 500,
        type: 'PRODUCT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeOrders(
  overrides: Partial<OrderRepositoryPort> = {},
): OrderRepositoryPort {
  return overrides as unknown as OrderRepositoryPort;
}

function makeInventory(
  overrides: Partial<StockInventoryRepositoryPort> = {},
): StockInventoryRepositoryPort {
  return overrides as unknown as StockInventoryRepositoryPort;
}

const AVAILABILITY = [
  {
    productId: 'p-1',
    stockLocationId: 'l-1',
    unitId: 'u-1',
    unitName: 'Morada Nova',
    locationName: 'Berçário Norte',
    quantity: 100,
    reserved: 0,
    available: 100,
  },
];

describe('Order ↔ Stock integration use cases', () => {
  describe('GetOrderStockOptionsUseCase', () => {
    it('devuelve opciones capaces de atender cada ítem', async () => {
      const getAvailability = jest.fn().mockResolvedValue(AVAILABILITY);
      const useCase = new GetOrderStockOptionsUseCase(
        makeOrders({ findById: jest.fn().mockResolvedValue(baseOrder()) }),
        makeInventory({ getAvailability }),
      );

      const result = await useCase.execute('order-1');

      expect(getAvailability).toHaveBeenCalledWith({ productId: 'p-1' });
      expect(result.items[0].attended).toBe(true);
      expect(result.items[0].options[0].stockLocationId).toBe('l-1');
      expect(result.anyShortage).toBe(false);
    });

    it('marca anyShortage si hay ítem sin opción suficiente', async () => {
      const getAvailability = jest
        .fn()
        .mockResolvedValue([{ ...AVAILABILITY[0], available: 1 }]);
      const useCase = new GetOrderStockOptionsUseCase(
        makeOrders({ findById: jest.fn().mockResolvedValue(baseOrder()) }),
        makeInventory({ getAvailability }),
      );

      const result = await useCase.execute('order-1');

      expect(result.items[0].attended).toBe(false);
      expect(result.anyShortage).toBe(true);
    });

    it('lanza 404 si el pedido no existe', async () => {
      const useCase = new GetOrderStockOptionsUseCase(
        makeOrders({ findById: jest.fn().mockResolvedValue(null) }),
        makeInventory(),
      );
      await expect(useCase.execute('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('ReserveOrderStockUseCase', () => {
    it('reserva stock vinculado al pedido y marca ESTOQUE_RESERVADO', async () => {
      const getAvailability = jest.fn().mockResolvedValue(AVAILABILITY);
      const getLevel = jest
        .fn()
        .mockResolvedValue({ quantity: 100, reserved: 0 });
      const createReservation = jest.fn().mockResolvedValue({ id: 'r-1' });
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const updateMock = jest
        .fn()
        .mockResolvedValue(
          baseOrder({ operationalStatus: 'ESTOQUE_RESERVADO' }),
        );
      const orders = makeOrders({
        findById: jest
          .fn()
          .mockResolvedValueOnce(baseOrder())
          .mockResolvedValue(
            baseOrder({ operationalStatus: 'ESTOQUE_RESERVADO' }),
          ),
        update: updateMock,
      });
      const useCase = new ReserveOrderStockUseCase(
        orders,
        makeInventory({
          getAvailability,
          getLevel,
          createReservation,
          upsertLevel,
        }),
      );

      const result = await useCase.execute('order-1', 'user-1');

      expect(createReservation).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1', quantity: 10 }),
      );
      expect(upsertLevel).toHaveBeenCalledWith('p-1', 'l-1', 100, 10);
      expect(updateMock).toHaveBeenCalledWith('order-1', {
        operationalStatus: 'ESTOQUE_RESERVADO',
      });
      expect(result.reservedCount).toBe(1);
    });

    it('no avanza si falta stock (400)', async () => {
      const useCase = new ReserveOrderStockUseCase(
        makeOrders({ findById: jest.fn().mockResolvedValue(baseOrder()) }),
        makeInventory({
          getAvailability: jest
            .fn()
            .mockResolvedValue([{ ...AVAILABILITY[0], available: 1 }]),
        }),
      );

      await expect(useCase.execute('order-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('ReleaseOrderStockUseCase', () => {
    it('cancela reservas activas y devuelve disponibilidad', async () => {
      const updateMock = jest
        .fn()
        .mockResolvedValue(
          baseOrder({ operationalStatus: 'AGUARDANDO_ESTOQUE' }),
        );
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(baseOrder()),
        update: updateMock,
      });
      const listReservations = jest
        .fn()
        .mockResolvedValue([
          { id: 'r-1', productId: 'p-1', stockLocationId: 'l-1', quantity: 10 },
        ]);
      const getLevel = jest
        .fn()
        .mockResolvedValue({ quantity: 100, reserved: 10 });
      const upsertLevel = jest.fn().mockResolvedValue(undefined);
      const cancelReservation = jest.fn().mockResolvedValue({ id: 'r-1' });
      const useCase = new ReleaseOrderStockUseCase(
        orders,
        makeInventory({
          listReservations,
          getLevel,
          upsertLevel,
          cancelReservation,
        }),
      );

      const result = await useCase.execute('order-1');

      expect(listReservations).toHaveBeenCalledWith({
        orderId: 'order-1',
        status: 'ACTIVA',
      });
      expect(upsertLevel).toHaveBeenCalledWith('p-1', 'l-1', 100, 0);
      expect(cancelReservation).toHaveBeenCalledWith('r-1');
      expect(result.releasedCount).toBe(1);
      expect(updateMock).toHaveBeenCalledWith('order-1', {
        operationalStatus: 'AGUARDANDO_ESTOQUE',
      });
    });

    it('lanza 404 si el pedido no existe', async () => {
      const useCase = new ReleaseOrderStockUseCase(
        makeOrders({ findById: jest.fn().mockResolvedValue(null) }),
        makeInventory(),
      );
      await expect(useCase.execute('ghost')).rejects.toThrow(NotFoundException);
    });
  });
});
