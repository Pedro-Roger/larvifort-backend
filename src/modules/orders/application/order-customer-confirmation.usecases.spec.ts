import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomerConfirmOrderUseCase } from './customer-confirm-order.usecase';
import { OrderCustomerChangeRequestUseCase } from './order-customer-change-request.usecase';
import type { OrderRepositoryPort } from './ports/order-repository.port';
import type { Order } from '../domain/order';

function baseOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    operationalStatus: 'AGUARDANDO_CONFIRMACION',
    clientId: 'client-1',
    subtotal: 500,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 500,
    paymentMethod: 'PIX',
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

describe('Customer confirmación / cambio', () => {
  describe('CustomerConfirmOrderUseCase', () => {
    it('confirma y registra quién/cuándo/nota y el evento', async () => {
      const updateMock = jest
        .fn()
        .mockResolvedValue(baseOrder({ operationalStatus: 'CONFIRMADO' }));
      const createCustomerEvent = jest.fn().mockResolvedValue({
        id: 'e-1',
        type: 'CONFIRMACION',
      });
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(baseOrder()),
        update: updateMock,
        createCustomerEvent,
      });
      const useCase = new CustomerConfirmOrderUseCase(orders);

      const result = await useCase.execute('order-1', 'user-1', 'Aprobado');

      expect(createCustomerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          type: 'CONFIRMACION',
          note: 'Aprobado',
          createdById: 'user-1',
        }),
      );
      expect(updateMock).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          customerConfirmedBy: 'user-1',
          customerConfirmationNote: 'Aprobado',
          operationalStatus: 'CONFIRMADO',
        }),
      );
      expect(result.operationalStatus).toBe('CONFIRMADO');
    });

    it('lanza 404 si el pedido no existe', async () => {
      const useCase = new CustomerConfirmOrderUseCase(
        makeOrders({ findById: jest.fn().mockResolvedValue(null) }),
      );
      await expect(useCase.execute('ghost', 'user-1', null)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza 400 si está FECHADO', async () => {
      const useCase = new CustomerConfirmOrderUseCase(
        makeOrders({
          findById: jest
            .fn()
            .mockResolvedValue(baseOrder({ operationalStatus: 'FECHADO' })),
        }),
      );
      await expect(useCase.execute('order-1', 'user-1', null)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('OrderCustomerChangeRequestUseCase', () => {
    it('guarda solicitud y revierte a AGUARDANDO_CONFIRMACION si estaba confirmado', async () => {
      const updateMock = jest
        .fn()
        .mockResolvedValue(
          baseOrder({ operationalStatus: 'AGUARDANDO_CONFIRMACION' }),
        );
      const createCustomerEvent = jest.fn().mockResolvedValue({
        id: 'e-2',
        type: 'SOLICITUD_CAMBIO',
      });
      const orders = makeOrders({
        findById: jest
          .fn()
          .mockResolvedValue(baseOrder({ operationalStatus: 'CONFIRMADO' })),
        update: updateMock,
        createCustomerEvent,
      });
      const useCase = new OrderCustomerChangeRequestUseCase(orders);

      const result = await useCase.execute(
        'order-1',
        'user-1',
        'Cambiar cantidad',
      );

      expect(createCustomerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SOLICITUD_CAMBIO',
          note: 'Cambiar cantidad',
        }),
      );
      expect(updateMock).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          operationalStatus: 'AGUARDANDO_CONFIRMACION',
          customerConfirmedBy: null,
        }),
      );
      expect(result.operationalStatus).toBe('AGUARDANDO_CONFIRMACION');
    });

    it('conserva el estado si no estaba confirmado', async () => {
      const updateMock = jest
        .fn()
        .mockResolvedValue(
          baseOrder({ operationalStatus: 'ESTOQUE_RESERVADO' }),
        );
      const orders = makeOrders({
        findById: jest
          .fn()
          .mockResolvedValue(
            baseOrder({ operationalStatus: 'ESTOQUE_RESERVADO' }),
          ),
        update: updateMock,
        createCustomerEvent: jest.fn(),
      });
      const useCase = new OrderCustomerChangeRequestUseCase(orders);

      await useCase.execute('order-1', 'user-1', 'Ajustar fecha');

      expect(updateMock).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          operationalStatus: 'ESTOQUE_RESERVADO',
        }),
      );
    });

    it('lanza 400 si está CANCELADO', async () => {
      const useCase = new OrderCustomerChangeRequestUseCase(
        makeOrders({
          findById: jest
            .fn()
            .mockResolvedValue(baseOrder({ operationalStatus: 'CANCELADO' })),
        }),
      );
      await expect(useCase.execute('order-1', 'user-1', 'X')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
