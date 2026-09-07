import { GetCalendarUseCase } from './get-calendar.usecase';
import type { AppointmentRepositoryPort } from './ports/appointment-repository.port';

describe('GetCalendarUseCase', () => {
  it('retorna dias com contagem', async () => {
    const countByDayMock = jest.fn().mockResolvedValue([
      { date: '2026-10-01', count: 3 },
      { date: '2026-10-05', count: 1 },
    ]);
    const repo: AppointmentRepositoryPort = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByDay: countByDayMock,
    };
    const uc = new GetCalendarUseCase(repo);
    const result = await uc.execute(2026, 10);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: '2026-10-01', count: 3 });
    expect(countByDayMock).toHaveBeenCalledWith(2026, 10);
  });
});
