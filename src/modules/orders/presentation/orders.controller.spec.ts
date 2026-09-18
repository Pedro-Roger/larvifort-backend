import { OrdersController } from './orders.controller';
import { CreateOrderUseCase } from '../application/create-order.usecase';
import { ListOrdersUseCase } from '../application/list-orders.usecase';
import { GetOrderByIdUseCase } from '../application/get-order-by-id.usecase';
import { GetOrderByNumberUseCase } from '../application/get-order-by-number.usecase';
import { UpdateOrderUseCase } from '../application/update-order.usecase';
import { CancelOrderUseCase } from '../application/cancel-order.usecase';
import { CloseOrderUseCase } from '../application/close-order.usecase';
import { GetOrderStockOptionsUseCase } from '../application/get-order-stock-options.usecase';
import { ReserveOrderStockUseCase } from '../application/reserve-order-stock.usecase';
import { ReleaseOrderStockUseCase } from '../application/release-order-stock.usecase';
import { CustomerConfirmOrderUseCase } from '../application/customer-confirm-order.usecase';
import { OrderCustomerChangeRequestUseCase } from '../application/order-customer-change-request.usecase';
import { GetOrderStatsUseCase } from '../application/get-order-stats.usecase';
import { DeleteOrderUseCase } from '../application/delete-order.usecase';
import type { Order, OrderStats } from '../domain/order';

describe('OrdersController', () => {
  const SAMPLE_ORDER: Order = {
    id: 'order-1',
    orderNumber: 'ORD-2026-0001',
    status: 'PEDIDO',
    phase: 'ABERTO',
    clientId: 'client-1',
    subtotal: 500,
    discount: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 500,
    orderDate: new Date(),
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_STATS: OrderStats = {
    totalOrders: 1,
    totalOrcamentos: 0,
    totalPedidos: 1,
    totalCancelled: 0,
    totalRevenue: 500,
    averageTicket: 500,
    phaseCounts: { ABERTO: 1 },
  };

  function makeSut() {
    const createOrder = { execute: jest.fn().mockResolvedValue(SAMPLE_ORDER) };
    const listOrders = {
      execute: jest.fn().mockResolvedValue({
        data: [SAMPLE_ORDER],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    };
    const getOrderById = { execute: jest.fn().mockResolvedValue(SAMPLE_ORDER) };
    const getOrderByNumber = {
      execute: jest.fn().mockResolvedValue(SAMPLE_ORDER),
    };
    const updateOrder = { execute: jest.fn().mockResolvedValue(SAMPLE_ORDER) };
    const cancelOrder = { execute: jest.fn().mockResolvedValue(SAMPLE_ORDER) };
    const closeOrder = {
      execute: jest.fn().mockResolvedValue({
        ...SAMPLE_ORDER,
        operationalStatus: 'FECHADO',
      }),
    };
    const getOrderStockOptions = {
      execute: jest.fn().mockResolvedValue({
        orderId: 'order-1',
        orderNumber: 'ORD-2026-0001',
        items: [],
        anyShortage: false,
      }),
    };
    const reserveOrderStock = {
      execute: jest.fn().mockResolvedValue({
        order: { ...SAMPLE_ORDER, operationalStatus: 'ESTOQUE_RESERVADO' },
        reservedCount: 1,
      }),
    };
    const releaseOrderStock = {
      execute: jest.fn().mockResolvedValue({
        order: { ...SAMPLE_ORDER, operationalStatus: 'AGUARDANDO_ESTOQUE' },
        releasedCount: 1,
      }),
    };
    const customerConfirmOrder = {
      execute: jest.fn().mockResolvedValue({
        ...SAMPLE_ORDER,
        operationalStatus: 'CONFIRMADO',
      }),
    };
    const orderCustomerChangeRequest = {
      execute: jest.fn().mockResolvedValue({
        ...SAMPLE_ORDER,
        operationalStatus: 'AGUARDANDO_CONFIRMACION',
      }),
    };
    const getOrderStats = {
      execute: jest.fn().mockResolvedValue(SAMPLE_STATS),
    };
    const deleteOrder = { execute: jest.fn().mockResolvedValue(undefined) };

    const sut = new OrdersController(
      createOrder as unknown as CreateOrderUseCase,
      listOrders as unknown as ListOrdersUseCase,
      getOrderById as unknown as GetOrderByIdUseCase,
      getOrderByNumber as unknown as GetOrderByNumberUseCase,
      updateOrder as unknown as UpdateOrderUseCase,
      cancelOrder as unknown as CancelOrderUseCase,
      closeOrder as unknown as CloseOrderUseCase,
      getOrderStockOptions as unknown as GetOrderStockOptionsUseCase,
      reserveOrderStock as unknown as ReserveOrderStockUseCase,
      releaseOrderStock as unknown as ReleaseOrderStockUseCase,
      customerConfirmOrder as unknown as CustomerConfirmOrderUseCase,
      orderCustomerChangeRequest as unknown as OrderCustomerChangeRequestUseCase,
      getOrderStats as unknown as GetOrderStatsUseCase,
      deleteOrder as unknown as DeleteOrderUseCase,
    );

    return {
      sut,
      createOrder,
      listOrders,
      getOrderById,
      getOrderByNumber,
      updateOrder,
      cancelOrder,
      closeOrder,
      getOrderStockOptions,
      reserveOrderStock,
      releaseOrderStock,
      customerConfirmOrder,
      orderCustomerChangeRequest,
      getOrderStats,
      deleteOrder,
    };
  }

  it('findMany delega para listOrders usecase', async () => {
    const { sut, listOrders } = makeSut();
    const result = await sut.findMany({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(listOrders.execute).toHaveBeenCalled();
  });

  it('getStats delega para getOrderStats usecase', async () => {
    const { sut, getOrderStats } = makeSut();
    const result = await sut.getStats({ page: 1, limit: 20 });
    expect(result.totalOrders).toBe(1);
    expect(getOrderStats.execute).toHaveBeenCalled();
  });

  it('findById delega para getOrderById usecase', async () => {
    const { sut, getOrderById } = makeSut();
    const result = await sut.findById('order-1');
    expect(result.id).toBe('order-1');
    expect(getOrderById.execute).toHaveBeenCalledWith('order-1');
  });

  it('findByOrderNumber delega para getOrderByNumber usecase', async () => {
    const { sut, getOrderByNumber } = makeSut();
    const result = await sut.findByOrderNumber('ORD-2026-0001');
    expect(result.orderNumber).toBe('ORD-2026-0001');
    expect(getOrderByNumber.execute).toHaveBeenCalledWith('ORD-2026-0001');
  });

  it('create delega para createOrder usecase', async () => {
    const { sut, createOrder } = makeSut();
    const result = await sut.create(
      {
        clientId: 'client-1',
        items: [{ productName: 'P1', quantity: 1, unitPrice: 100 }],
      },
      'user-1',
    );
    expect(result.id).toBe('order-1');
    expect(createOrder.execute).toHaveBeenCalledWith(
      expect.objectContaining({ clientId: 'client-1', creatorId: 'user-1' }),
    );
  });

  it('cancel delega para cancelOrder usecase', async () => {
    const { sut, cancelOrder } = makeSut();
    const result = await sut.cancel('order-1', { reason: 'Desistência' });
    expect(result.id).toBe('order-1');
    expect(cancelOrder.execute).toHaveBeenCalledWith('order-1', 'Desistência');
  });

  it('delete delega para deleteOrder usecase', async () => {
    const { sut, deleteOrder } = makeSut();
    await sut.delete('order-1');
    expect(deleteOrder.execute).toHaveBeenCalledWith('order-1');
  });

  it('close delega para closeOrder usecase con usuario actual', async () => {
    const { sut, closeOrder } = makeSut();
    const result = await sut.close('order-1', 'user-1');
    expect(result.operationalStatus).toBe('FECHADO');
    expect(closeOrder.execute).toHaveBeenCalledWith('order-1', 'user-1');
  });

  it('stockOptions delega para getOrderStockOptions usecase', async () => {
    const { sut, getOrderStockOptions } = makeSut();
    const result = await sut.stockOptions('order-1');
    expect(result.anyShortage).toBe(false);
    expect(getOrderStockOptions.execute).toHaveBeenCalledWith('order-1');
  });

  it('reserveStock delega para reserveOrderStock usecase', async () => {
    const { sut, reserveOrderStock } = makeSut();
    const result = await sut.reserveStock('order-1', 'user-1');
    expect(result.order.operationalStatus).toBe('ESTOQUE_RESERVADO');
    expect(reserveOrderStock.execute).toHaveBeenCalledWith('order-1', 'user-1');
  });

  it('releaseStock delega para releaseOrderStock usecase', async () => {
    const { sut, releaseOrderStock } = makeSut();
    const result = await sut.releaseStock('order-1');
    expect(result.releasedCount).toBe(1);
    expect(releaseOrderStock.execute).toHaveBeenCalledWith('order-1');
  });

  it('customerConfirmation delega con usuario y nota', async () => {
    const { sut, customerConfirmOrder } = makeSut();
    const result = await sut.customerConfirmation(
      'order-1',
      { note: 'Confirmado' },
      'user-1',
    );
    expect(result.operationalStatus).toBe('CONFIRMADO');
    expect(customerConfirmOrder.execute).toHaveBeenCalledWith(
      'order-1',
      'user-1',
      'Confirmado',
    );
  });

  it('customerChangeRequest delega con usuario y nota', async () => {
    const { sut, orderCustomerChangeRequest } = makeSut();
    const result = await sut.customerChangeRequest(
      'order-1',
      { note: 'Cambiar cantidad' },
      'user-1',
    );
    expect(result.operationalStatus).toBe('AGUARDANDO_CONFIRMACION');
    expect(orderCustomerChangeRequest.execute).toHaveBeenCalledWith(
      'order-1',
      'user-1',
      'Cambiar cantidad',
    );
  });
});
