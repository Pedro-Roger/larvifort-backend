import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AutomationEngineService } from './application/automation-engine.service';
import { AutomationOutboxWorker } from './application/automation-outbox.worker';
import { ManageAutomationsUseCase } from './application/manage-automations.usecase';
import { AUTOMATION_ACTION_PORT } from './application/ports/automation-action.port';
import { AUTOMATION_OUTBOX_PORT } from './application/ports/automation-outbox.port';
import { AUTOMATION_REPOSITORY_PORT } from './application/ports/automation-repository.port';
import {
  PRISMA_AUTOMATIONS_TOKEN,
  PrismaAutomationRepository,
} from './infra/automation.prisma.repository';
import {
  PRISMA_AUTOMATION_OUTBOX_TOKEN,
  PrismaAutomationOutboxRepository,
} from './infra/automation-outbox.prisma.repository';
import {
  PRISMA_AUTOMATION_ACTION_TOKEN,
  TaskAutomationActionService,
} from './infra/task-automation-action.service';
import { AutomationsController } from './presentation/automations.controller';

@Module({
  controllers: [AutomationsController],
  providers: [
    ManageAutomationsUseCase,
    AutomationEngineService,
    AutomationOutboxWorker,
    PrismaAutomationRepository,
    PrismaAutomationOutboxRepository,
    TaskAutomationActionService,
    {
      provide: AUTOMATION_REPOSITORY_PORT,
      useClass: PrismaAutomationRepository,
    },
    {
      provide: AUTOMATION_OUTBOX_PORT,
      useClass: PrismaAutomationOutboxRepository,
    },
    { provide: AUTOMATION_ACTION_PORT, useClass: TaskAutomationActionService },
    { provide: PRISMA_AUTOMATIONS_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_AUTOMATION_OUTBOX_TOKEN, useExisting: PrismaService },
    { provide: PRISMA_AUTOMATION_ACTION_TOKEN, useExisting: PrismaService },
  ],
  exports: [AUTOMATION_OUTBOX_PORT, AutomationOutboxWorker],
})
export class AutomationsModule {}
