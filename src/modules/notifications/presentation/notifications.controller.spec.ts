import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(() => {
    controller = new NotificationsController();
  });

  it('listNotifications retorna array vazio como fallback gracioso', () => {
    expect(controller.listNotifications()).toEqual([]);
  });

  it('getPreferences retorna preferências padrão', () => {
    const prefs = controller.getPreferences();
    expect(prefs.emailNotifications).toBe(true);
    expect(prefs.taskStatusChanged).toBe(true);
  });

  it('updatePreferences mescla preferências enviadas', () => {
    const updated = controller.updatePreferences({ soundEnabled: true });
    expect(updated.soundEnabled).toBe(true);
    expect(updated.emailNotifications).toBe(true);
  });

  it('markAllRead retorna success true', () => {
    expect(controller.markAllRead()).toEqual({ success: true });
  });

  it('updateNotification retorna id e updates', () => {
    expect(controller.updateNotification('n-1', { read: true })).toEqual({
      id: 'n-1',
      read: true,
    });
  });

  it('deleteNotification conclui sem erro', () => {
    expect(() => controller.deleteNotification()).not.toThrow();
  });
});
