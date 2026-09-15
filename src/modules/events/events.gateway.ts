import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { EventsService } from './events.service';

function getSecret(): string {
  return process.env.JWT_SECRET ?? 'lavifort-dev-secret';
}

interface JwtHandshake {
  sub?: string;
  email?: string;
  role?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
  maxHttpBufferSize: 1e6,
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  afterInit(server: Server): void {
    this.eventsService.setServer(server);
  }

  private authenticate(
    socket: Socket,
  ): { userId: string; email: string } | null {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, getSecret()) as JwtHandshake;
      if (!decoded.sub || !decoded.email) return null;
      return { userId: decoded.sub, email: decoded.email };
    } catch {
      return null;
    }
  }

  handleConnection(socket: Socket): void {
    const user = this.authenticate(socket);
    if (!user) {
      socket.disconnect(true);
      return;
    }

    (socket.data as { userId: string; email: string }).userId = user.userId;
    (socket.data as { userId: string; email: string }).email = user.email;

    const boardId = socket.handshake.query?.boardId as string | undefined;
    if (boardId) {
      (socket.data as { boardId?: string }).boardId = boardId;
      this.eventsService.joinBoard(socket, boardId);
      this.eventsService.registerPresence(boardId, user.userId, socket.id);
      this.eventsService.syncPresence(socket, boardId);
    }
  }

  handleDisconnect(socket: Socket): void {
    const boardId = (socket.data as { boardId?: string }).boardId;
    if (boardId) {
      this.eventsService.leaveBoard(socket, boardId);
      this.eventsService.unregisterPresence(
        boardId,
        (socket.data as { userId: string }).userId,
        socket.id,
      );
    }
  }

  @SubscribeMessage('join:board')
  onJoinBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { boardId: string },
  ): void {
    this.eventsService.joinBoard(socket, body.boardId);
  }

  @SubscribeMessage('leave:board')
  onLeaveBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { boardId: string },
  ): void {
    this.eventsService.leaveBoard(socket, body.boardId);
  }

  @SubscribeMessage('presence:sync')
  onPresenceSync(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { boardId: string },
  ): void {
    this.eventsService.syncPresence(socket, body.boardId);
  }
}
