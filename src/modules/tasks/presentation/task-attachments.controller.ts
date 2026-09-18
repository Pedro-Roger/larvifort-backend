import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { UploadTaskAttachmentUseCase } from '../application/upload-task-attachment.usecase';
import { ListTaskAttachmentsUseCase } from '../application/list-task-attachments.usecase';
import { DeleteTaskAttachmentUseCase } from '../application/delete-task-attachment.usecase';
import { TaskAttachment } from '../domain/task';

@ApiTags('Tarefas - Anexos')
@ApiBearerAuth('access-token')
@Controller('tasks/:id/attachments')
@UseGuards(JwtAuthGuard)
export class TaskAttachmentsController {
  constructor(
    private readonly uploadAttachment: UploadTaskAttachmentUseCase,
    private readonly listAttachments: ListTaskAttachmentsUseCase,
    private readonly deleteAttachment: DeleteTaskAttachmentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload de anexo para tarefa' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TaskAttachment> {
    return this.uploadAttachment.execute(taskId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Listar anexos da tarefa' })
  async list(@Param('id') taskId: string): Promise<TaskAttachment[]> {
    return this.listAttachments.execute(taskId);
  }

  @Delete(':attachmentId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletar anexo da tarefa' })
  async delete(
    @Param('id') taskId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<void> {
    await this.deleteAttachment.execute(taskId, attachmentId);
  }
}
