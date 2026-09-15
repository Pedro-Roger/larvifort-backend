import type { Knex } from 'knex';

const TRIGGERS = [
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_MOVED',
  'TASK_ASSIGNED',
  'TASK_DUE_SOON',
  'TASK_OVERDUE',
  'APPOINTMENT_CREATED',
  'ORDER_CREATED',
];

export async function up(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE "ProjetoAutomacao" DROP CONSTRAINT IF EXISTS "ProjetoAutomacao_trigger_check"');
  await knex.raw(`ALTER TABLE "ProjetoAutomacao" ADD CONSTRAINT "ProjetoAutomacao_trigger_check" CHECK ("trigger" IN (${TRIGGERS.map((value) => `'${value}'`).join(', ')}))`);
  await knex.raw('ALTER TABLE "AutomationOutboxEvent" DROP CONSTRAINT IF EXISTS "AutomationOutboxEvent_eventType_check"');
  await knex.raw(`ALTER TABLE "AutomationOutboxEvent" ADD CONSTRAINT "AutomationOutboxEvent_eventType_check" CHECK ("eventType" IN (${TRIGGERS.map((value) => `'${value}'`).join(', ')}))`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE "ProjetoAutomacao" DROP CONSTRAINT IF EXISTS "ProjetoAutomacao_trigger_check"');
  await knex.raw('ALTER TABLE "ProjetoAutomacao" ADD CONSTRAINT "ProjetoAutomacao_trigger_check" CHECK ("trigger" IN (\'TASK_CREATED\', \'TASK_UPDATED\', \'TASK_MOVED\', \'TASK_ASSIGNED\', \'TASK_DUE_SOON\', \'TASK_OVERDUE\', \'APPOINTMENT_CREATED\'))');
  await knex.raw('ALTER TABLE "AutomationOutboxEvent" DROP CONSTRAINT IF EXISTS "AutomationOutboxEvent_eventType_check"');
  await knex.raw('ALTER TABLE "AutomationOutboxEvent" ADD CONSTRAINT "AutomationOutboxEvent_eventType_check" CHECK ("eventType" IN (\'TASK_CREATED\', \'TASK_UPDATED\', \'TASK_MOVED\', \'TASK_ASSIGNED\', \'TASK_DUE_SOON\', \'TASK_OVERDUE\', \'APPOINTMENT_CREATED\'))');
}
