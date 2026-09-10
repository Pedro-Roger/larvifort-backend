import type { Knex } from 'knex';

const TRIGGERS = [
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_MOVED',
  'TASK_ASSIGNED',
  'TASK_DUE_SOON',
  'TASK_OVERDUE',
] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ProjetoAutomacao', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('projetoId').notNullable().references('Projeto.id').onDelete('CASCADE');
    t.text('name').notNullable();
    t.text('description').nullable();
    t.enu('trigger', [...TRIGGERS], { useNative: false, existingType: false, enumName: 'ProjetoAutomacao_trigger' }).notNullable();
    t.jsonb('conditions').notNullable().defaultTo('[]');
    t.enu('conditionMode', ['AND', 'OR'], { useNative: false, existingType: false, enumName: 'ProjetoAutomacao_conditionMode' }).notNullable().defaultTo('AND');
    t.jsonb('actions').notNullable();
    t.text('schedule').nullable();
    t.boolean('isActive').notNullable().defaultTo(true);
    t.integer('priority').notNullable().defaultTo(0);
    t.uuid('createdBy').notNullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('deletedAt', { useTz: true }).nullable();
    t.index(['projetoId', 'trigger', 'isActive', 'priority']);
    t.index(['deletedAt']);
  });

  await knex.schema.createTable('AutomationExecution', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('automationId').notNullable().references('ProjetoAutomacao.id').onDelete('CASCADE');
    t.uuid('eventId').notNullable();
    t.integer('attempt').notNullable();
    t.integer('durationMs').nullable();
    t.enu('result', ['RUNNING', 'SUCCESS', 'SKIPPED', 'FAILED'], { useNative: false, existingType: false, enumName: 'AutomationExecution_result' }).notNullable().defaultTo('RUNNING');
    t.text('error').nullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('completedAt', { useTz: true }).nullable();
    t.unique(['automationId', 'eventId', 'attempt']);
    t.index(['eventId']);
  });

  await knex.schema.createTable('AutomationOutboxEvent', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('eventId').notNullable().unique();
    t.enu('eventType', [...TRIGGERS], { useNative: false, existingType: false, enumName: 'AutomationOutboxEvent_eventType' }).notNullable();
    t.uuid('projetoId').notNullable().references('Projeto.id').onDelete('CASCADE');
    t.uuid('aggregateId').notNullable();
    t.jsonb('payload').notNullable();
    t.integer('depth').notNullable().defaultTo(0);
    t.jsonb('causationChain').notNullable().defaultTo('[]');
    t.enu('status', ['PENDING', 'PROCESSED', 'DEAD'], { useNative: false, existingType: false, enumName: 'AutomationOutboxEvent_status' }).notNullable().defaultTo('PENDING');
    t.integer('attempts').notNullable().defaultTo(0);
    t.timestamp('availableAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('processedAt', { useTz: true }).nullable();
    t.text('lastError').nullable();
    t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updatedAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['status', 'availableAt']);
    t.index(['projetoId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('AutomationOutboxEvent');
  await knex.schema.dropTableIfExists('AutomationExecution');
  await knex.schema.dropTableIfExists('ProjetoAutomacao');
}
