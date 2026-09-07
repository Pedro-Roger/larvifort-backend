import { AppointmentsController } from './appointments.controller';
import { ListAppointmentsUseCase } from '../application/list-appointments.usecase';
import { GetAppointmentByIdUseCase } from '../application/get-appointment-by-id.usecase';
import { CreateAppointmentUseCase } from '../application/create-appointment.usecase';
import { UpdateAppointmentUseCase } from '../application/update-appointment.usecase';
import { DeleteAppointmentUseCase } from '../application/delete-appointment.usecase';
import { GetCalendarUseCase } from '../application/get-calendar.usecase';
import type { Appointment } from '../domain/appointment';

describe('AppointmentsController', () => {
  const SAMPLE: Appointment = {
    id: 'a-1',
    tipo: 'VISITA',
    titulo: 'Visita ao cliente',
    data: new Date('2026-10-01T10:00:00'),
    horario: '10:00',
    endereco: 'Rua Exemplo, 123',
    observacoes: null,
    clienteId: 'c-1',
    empresaId: null,
    ownerId: 'u-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  function makeController() {
    const listAppointments = {
      execute: jest.fn().mockResolvedValue({
        data: [SAMPLE],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    };
    const getAppointmentById = { execute: jest.fn().mockResolvedValue(SAMPLE) };
    const createAppointment = { execute: jest.fn().mockResolvedValue(SAMPLE) };
    const updateAppointment = { execute: jest.fn().mockResolvedValue(SAMPLE) };
    const deleteAppointment = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const getCalendar = {
      execute: jest.fn().mockResolvedValue([{ date: '2026-10-01', count: 2 }]),
    };

    const controller = new AppointmentsController(
      listAppointments as unknown as ListAppointmentsUseCase,
      getAppointmentById as unknown as GetAppointmentByIdUseCase,
      createAppointment as unknown as CreateAppointmentUseCase,
      updateAppointment as unknown as UpdateAppointmentUseCase,
      deleteAppointment as unknown as DeleteAppointmentUseCase,
      getCalendar as unknown as GetCalendarUseCase,
    );

    return {
      controller,
      listAppointments,
      getAppointmentById,
      createAppointment,
      updateAppointment,
      deleteAppointment,
      getCalendar,
    };
  }

  it('GET / delega para listAppointments', async () => {
    const { controller, listAppointments } = makeController();
    const result = await controller.findMany({ page: 1, limit: 20 });
    expect(listAppointments.execute).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
  });

  it('GET /:id delega para getAppointmentById', async () => {
    const { controller, getAppointmentById } = makeController();
    const result = await controller.findById('a-1');
    expect(getAppointmentById.execute).toHaveBeenCalledWith('a-1');
    expect(result.id).toBe('a-1');
  });

  it('POST / delega para createAppointment', async () => {
    const { controller, createAppointment } = makeController();
    const result = await controller.create({
      tipo: 'VISITA',
      titulo: 'Visita',
      data: '2026-10-01T10:00:00.000Z',
      clienteId: 'c-1',
      endereco: 'Rua X',
    });
    expect(createAppointment.execute).toHaveBeenCalled();
    expect(result.id).toBe('a-1');
  });

  it('PATCH /:id delega para updateAppointment', async () => {
    const { controller, updateAppointment } = makeController();
    const result = await controller.update('a-1', { titulo: 'Novo' });
    expect(updateAppointment.execute).toHaveBeenCalledWith(
      'a-1',
      expect.objectContaining({ titulo: 'Novo' }),
    );
    expect(result.id).toBe('a-1');
  });

  it('DELETE /:id delega para deleteAppointment', async () => {
    const { controller, deleteAppointment } = makeController();
    await controller.delete('a-1');
    expect(deleteAppointment.execute).toHaveBeenCalledWith('a-1');
  });

  it('GET /calendario delega para getCalendar', async () => {
    const { controller, getCalendar } = makeController();
    const result = await controller.calendar({ mes: '2026-10' });
    expect(getCalendar.execute).toHaveBeenCalledWith(2026, 10);
    expect(result).toHaveLength(1);
  });
});
