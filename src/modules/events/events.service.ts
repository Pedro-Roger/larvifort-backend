import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class EventsService implements OnModuleDestroy {
  private wss: Server | null = null;

  setServer(server: Server): void {
    this.wss = server;
  }

  private getServer(): Server {
    if (!this.wss) {
      throw new Error('WebSocket server not initialized');
    }
    return this.wss;
  }

  joinBoard(socket: Socket, boardId: string): void {
    void socket.join(`board:${boardId}`);
  }

  leaveBoard(socket: Socket, boardId: string): void {
    void socket.leave(`board:${boardId}`);
  }

  emitToBoard(boardId: string, event: string, data: unknown): void {
    if (!this.wss) {
      return;
    }
    try {
      void this.wss.to(`board:${boardId}`).emit(event, data);
    } catch {
      // Ignora erro de socket para não quebrar a transação HTTP
    }
  }

  emitTaskCreated(boardId: string, task: unknown): void {
    this.emitToBoard(boardId, 'task:created', task);
  }

  emitTaskUpdated(boardId: string, task: unknown): void {
    this.emitToBoard(boardId, 'task:updated', task);
  }

  emitTaskDeleted(boardId: string, taskId: string): void {
    this.emitToBoard(boardId, 'task:deleted', { id: taskId });
  }

  emitTaskMoved(boardId: string, payload: unknown): void {
    this.emitToBoard(boardId, 'task:moved', payload);
  }

  emitColumnCreated(boardId: string, column: unknown): void {
    this.emitToBoard(boardId, 'column:created', column);
  }

  emitColumnUpdated(boardId: string, column: unknown): void {
    this.emitToBoard(boardId, 'column:updated', column);
  }

  emitColumnDeleted(boardId: string, columnId: string): void {
    this.emitToBoard(boardId, 'column:deleted', { id: columnId });
  }

  onModuleDestroy(): void {
    if (this.wss) {
      void this.wss.close();
      this.wss = null;
    }
  }
}
