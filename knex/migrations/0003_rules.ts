import type { Knex } from 'knex';

const RULE_SCOPE = ['USER', 'TEAM', 'ROLE', 'COLUMN'] as const;
const RULE_ACTION = ['ALLOW_MOVE', 'DENY_MOVE', 'REQUIRE_FIELD', 'SET_FIELD', 'TRIGGER_AUTOMATION'] as const;

function uuidPk(t: Knex.CreateTableBuilder, knex: Knex): void {
  t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
}

function timestamps(t: Knex.CreateTableBuilder, knex: Knex): void {
  t.timestamp('createdAt', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
  t.timestamp('updatedAt', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('Rule', (t) => {
    uuidPk(t, knex);
    t.text('name').notNullable();
    t.text('description').nullable();
    t.enu('scope', [...RULE_SCOPE], {
      useNative: false,
      existingType: false,
      enumName: 'Rule_scope',
    }).notNullable();
    t.uuid('scopeId').nullable(); // userId, teamId, role, or columnId depending on scope
    t.uuid('projectId').nullable();
    t.foreign('projectId').references('Projeto.id').onDelete('SET NULL');
    t.uuid('columnId').nullable();
    t.foreign('columnId').references('ProjetoColumn.id').onDelete('SET NULL');
    t.enu('action', [...RULE_ACTION], {
      useNative: false,
      existingType: false,
      enumName: 'Rule_action',
    }).notNullable();
    t.jsonb('conditions').notNullable().defaultTo('{}');
    t.jsonb('parameters').notNullable().defaultTo('{}');
    t.integer('priority').notNullable().defaultTo(0);
    t.boolean('active').notNullable().defaultTo(true);
    timestamps(t, knex);
    t.index(['scope', 'scopeId']);
    t.index(['projectId']);
    t.index(['columnId']);
    t.index(['active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Rule');
}