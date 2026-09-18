import { DeliveryController } from './delivery.controller';

describe('DeliveryController contract', () => {
  it('lists deliveries and supports delivery lifecycle operations', async () => {
    const service = {
      list: jest.fn().mockResolvedValue([{ id: 'delivery-1' }]),
      create: jest.fn().mockResolvedValue({ id: 'delivery-1' }),
      assign: jest.fn().mockResolvedValue({ id: 'delivery-1' }),
      updateStatus: jest.fn().mockResolvedValue({ id: 'delivery-1' }),
      assignByDelivery: jest.fn().mockResolvedValue({ id: 'delivery-1' }),
      updateStatusByDelivery: jest.fn().mockResolvedValue({ id: 'delivery-1' }),
      addProof: jest.fn().mockResolvedValue({ id: 'delivery-1' }),
    };
    const controller = new DeliveryController(service);

    await expect(controller.list()).resolves.toEqual([{ id: 'delivery-1' }]);
    await expect(controller.create('order-1')).resolves.toEqual({ id: 'delivery-1' });
    await expect(controller.assignByDelivery('delivery-1', { driverId: 'driver-1', vehicleId: 'vehicle-1' })).resolves.toEqual({ id: 'delivery-1' });
    await expect(controller.updateByDelivery('delivery-1', { status: 'EM_ROTA' })).resolves.toEqual({ id: 'delivery-1' });
    await expect(controller.proof('delivery-1', { proofUrl: 'https://example.test/proof' })).resolves.toEqual({ id: 'delivery-1' });
  });
});
