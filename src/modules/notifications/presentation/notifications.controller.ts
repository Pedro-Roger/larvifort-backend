import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';

export interface NotificationDto {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferencesDto {
  emailNotifications: boolean;
  browserNotifications: boolean;
  taskAssigned: boolean;
  taskStatusChanged: boolean;
  systemAlerts: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferencesDto = {
  emailNotifications: true,
  browserNotifications: true,
  taskAssigned: true,
  taskStatusChanged: true,
  systemAlerts: true,
  soundEnabled: false,
};

@ApiTags('Notificações')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  listNotifications(): NotificationDto[] {
    return [];
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Obter preferências de notificação' })
  getPreferences(): NotificationPreferencesDto {
    return DEFAULT_PREFERENCES;
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Atualizar preferências de notificação' })
  updatePreferences(
    @Body() dto: Partial<NotificationPreferencesDto>,
  ): NotificationPreferencesDto {
    return { ...DEFAULT_PREFERENCES, ...dto };
  }

  @Post('mark-all-read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  markAllRead(): { success: boolean } {
    return { success: true };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar estado de leitura ou arquivamento' })
  updateNotification(
    @Param('id') id: string,
    @Body() dto: { read?: boolean; archived?: boolean },
  ): { id: string; read?: boolean; archived?: boolean } {
    return { id, ...dto };
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir notificação' })
  deleteNotification(): void {
    // No-op gracioso
  }
}
