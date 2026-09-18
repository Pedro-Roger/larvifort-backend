import { LogisticsController } from './logistics.controller';

describe('LogisticsController contract', () => {
  it('lists and mutates drivers and vehicles through the repository', async () => {
    const repository = {
      listDrivers: jest.fn().mockResolvedValue([{ id: 'driver-1' }]),
      createDriver: jest.fn().mockResolvedValue({ id: 'driver-2' }),
      updateDriver: jest.fn().mockResolvedValue({ id: 'driver-1' }),
      listVehicles: jest.fn().mockResolvedValue([{ id: 'vehicle-1' }]),
      createVehicle: jest.fn().mockResolvedValue({ id: 'vehicle-2' }),
      updateVehicle: jest.fn().mockResolvedValue({ id: 'vehicle-1' }),
    };
    const controller = new LogisticsController(repository);

    await expect(controller.listDrivers()).resolves.toEqual([{ id: 'driver-1' }]);
    await expect(controller.createDriver({ name: 'João' })).resolves.toEqual({ id: 'driver-2' });
    await expect(controller.updateDriver('driver-1', { status: 'EM_ROTA' })).resolves.toEqual({ id: 'driver-1' });
    await expect(controller.listVehicles()).resolves.toEqual([{ id: 'vehicle-1' }]);
    await expect(controller.createVehicle({ plate: 'ABC1D23' })).resolves.toEqual({ id: 'vehicle-2' });
    await expect(controller.updateVehicle('vehicle-1', { status: 'EM_ROTA' })).resolves.toEqual({ id: 'vehicle-1' });
  });
});
