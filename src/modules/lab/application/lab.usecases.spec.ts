import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GenerateLabWorkOrderUseCase } from './generate-lab-work-order.usecase';
import { UpdateLabWorkOrderStatusUseCase } from './update-lab-work-order-status.usecase';
import { GetLabWorkOrderUseCase } from './get-lab-work-order.usecase';
import { ListLabOrdersUseCase } from './list-lab-orders.usecase';
import type { LabRepositoryPort } from './ports/lab-repository.port';
import type { OrderRepositoryPort } from '../../orders/application/ports/order-repository.port';
import type { LabWorkOrder } from '../domain/lab-work-order';
import type { Order } from '../../orders/domain/order';

function baseOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    operationalStatus: 'FECHADO',
    clientId: 'client-1',
    clientName: 'João Silva',
    subtotal: 500,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 500,
    paymentMethod: 'PIX',
    orderDate: new Date(),
    deliveryDate: new Date('2026-09-25'),
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

function baseWorkOrder(overrides: Partial<LabWorkOrder> = {}): LabWorkOrder {
  return {
    id: 'wo-1',
    orderId: 'order-1',
    orderNumber: 'ORD-2026-0001',
    clientName: 'João Silva',
    productId: 'p-1',
    productName: 'Pós-larva',
    quantity: 10,
    unit: 'MILHEIRO',
    stockUnitId: null,
    stockUnitName: null,
    stockLocationId: null,
    stockLocationName: null,
    deliveryDate: new Date('2026-09-25'),
    status: 'AGUARDANDO_LABORATORIO',
    statusChangedBy: null,
    statusChangedAt: null,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeLab(
  overrides: Partial<LabRepositoryPort> = {},
): LabRepositoryPort {
  return overrides as unknown as LabRepositoryPort;
}

function makeOrders(
  overrides: Partial<OrderRepositoryPort> = {},
): OrderRepositoryPort {
  return overrides as unknown as OrderRepositoryPort;
}

describe('Laboratório (API-021)', () => {
  describe('GenerateLabWorkOrderUseCase', () => {
    it('gera uma OS por ítem de produto a partir de pedido fechado', async () => {
      const createMock = jest.fn().mockResolvedValue(baseWorkOrder());
      const lab = makeLab({
        create: createMock,
        hasActiveForOrder: jest.fn().mockResolvedValue(false),
      });
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(baseOrder()),
      });
      const useCase = new GenerateLabWorkOrderUseCase(orders, lab);

      const result = await useCase.execute('order-1', 'user-1', {
        stockUnitName: 'Morada Nova',
      });

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          productId: 'p-1',
          productName: 'Pós-larva',
          quantity: 10,
          createdById: 'user-1',
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('lança 404 se o pedido não existe', async () => {
      const lab = makeLab({});
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(null),
      });
      const useCase = new GenerateLabWorkOrderUseCase(orders, lab);
      await expect(useCase.execute('ghost', 'u', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lança 400 se o pedido não está fechado', async () => {
      const lab = makeLab({});
      const orders = makeOrders({
        findById: jest
          .fn()
          .mockResolvedValue(baseOrder({ operationalStatus: 'CONFIRMADO' })),
      });
      const useCase = new GenerateLabWorkOrderUseCase(orders, lab);
      await expect(useCase.execute('order-1', 'u', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lança 400 se já existe OS ativa', async () => {
      const lab = makeLab({
        hasActiveForOrder: jest.fn().mockResolvedValue(true),
      });
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(baseOrder()),
      });
      const useCase = new GenerateLabWorkOrderUseCase(orders, lab);
      await expect(useCase.execute('order-1', 'u', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lança 400 se o pedido não possui ítem de produto', async () => {
      const lab = makeLab({
        hasActiveForOrder: jest.fn().mockResolvedValue(false),
      });
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(baseOrder({ items: [] })),
      });
      const useCase = new GenerateLabWorkOrderUseCase(orders, lab);
      await expect(useCase.execute('order-1', 'u', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('UpdateLabWorkOrderStatusUseCase', () => {
    it('atualiza status e registra responsável/horário', async () => {
      const updateStatus = jest
        .fn()
        .mockResolvedValue(
          baseWorkOrder({ status: 'RECEBIDO', statusChangedBy: 'user-1' }),
        );
      const lab = makeLab({
        findById: jest.fn().mockResolvedValue(baseWorkOrder()),
        updateStatus,
      });
      const orders = makeOrders({});
      const useCase = new UpdateLabWorkOrderStatusUseCase(lab, orders);

      const result = await useCase.execute('wo-1', 'RECEBIDO', 'user-1');

      expect(updateStatus).toHaveBeenCalledWith(
        'wo-1',
        expect.objectContaining({
          status: 'RECEBIDO',
          statusChangedBy: 'user-1',
          statusChangedAt: expect.any(Date) as Date,
        }),
      );
      expect(result.status).toBe('RECEBIDO');
    });

    it('avança o pedido para AGUARDANDO_SEPARACAO quando PRONTO_PARA_SEPARACAO', async () => {
      const updateStatus = jest
        .fn()
        .mockResolvedValue(baseWorkOrder({ status: 'PRONTO_PARA_SEPARACAO' }));
      const updateOrder = jest
        .fn()
        .mockResolvedValue(
          baseOrder({ operationalStatus: 'AGUARDANDO_SEPARACAO' }),
        );
      const lab = makeLab({
        findById: jest.fn().mockResolvedValue(baseWorkOrder()),
        updateStatus,
      });
      const orders = makeOrders({
        findById: jest.fn().mockResolvedValue(baseOrder()),
        update: updateOrder,
      });
      const useCase = new UpdateLabWorkOrderStatusUseCase(lab, orders);

      await useCase.execute('wo-1', 'PRONTO_PARA_SEPARACAO', 'user-1');

      expect(updateOrder).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({ operationalStatus: 'AGUARDANDO_SEPARACAO' }),
      );
    });

    it('lança 400 para estado inválido', async () => {
      const lab = makeLab({});
      const orders = makeOrders({});
      const useCase = new UpdateLabWorkOrderStatusUseCase(lab, orders);
      await expect(
        useCase.execute('wo-1', 'INVALIDO' as never, 'u'),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança 404 se a OS não existe', async () => {
      const lab = makeLab({
        findById: jest.fn().mockResolvedValue(null),
      });
      const useCase = new UpdateLabWorkOrderStatusUseCase(lab, makeOrders({}));
      await expect(useCase.execute('ghost', 'RECEBIDO', 'u')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GetLabWorkOrderUseCase', () => {
    it('retorna OS por ID', async () => {
      const lab = makeLab({
        findById: jest.fn().mockResolvedValue(baseWorkOrder()),
      });
      const useCase = new GetLabWorkOrderUseCase(lab);
      const result = await useCase.execute('wo-1');
      expect(result.id).toBe('wo-1');
    });

    it('lança 404 se não existe', async () => {
      const lab = makeLab({ findById: jest.fn().mockResolvedValue(null) });
      const useCase = new GetLabWorkOrderUseCase(lab);
      await expect(useCase.execute('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListLabOrdersUseCase', () => {
    it('delega filtros ao repositório', async () => {
      const listLabOrders = jest
        .fn()
        .mockResolvedValue({ data: [], meta: { total: 0 } });
      const useCase = new ListLabOrdersUseCase(makeLab({ listLabOrders }));
      await useCase.execute({ page: 1, limit: 10 });
      expect(listLabOrders).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
});
