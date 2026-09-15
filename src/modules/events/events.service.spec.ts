import { EventsService } from './events.service';

describe('EventsService presence', () => {
  it('sincroniza usuários online por quadro e remove quando desconectam', () => {
    const emit = jest.fn();
    const service = new EventsService();
    service.setServer({ to: () => ({ emit }) } as never);

    service.registerPresence('board-1', 'user-1', 'socket-1');
    service.registerPresence('board-1', 'user-2', 'socket-2');
    expect(service.getOnlineUserIds('board-1')).toEqual(['user-1', 'user-2']);

    service.unregisterPresence('board-1', 'user-1', 'socket-1');
    expect(service.getOnlineUserIds('board-1')).toEqual(['user-2']);
  });
});
