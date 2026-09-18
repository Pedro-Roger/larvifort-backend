import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('TaskAttachment', (table) => {
    table.uuid('id').primary();
    table
      .uuid('taskId')
      .notNullable()
      .references('id')
      .inTable('Task')
      .onDelete('CASCADE');
    table.string('filename').notNullable();
    table.string('path').notNullable();
    table.string('mimeType').notNullable();
    table.integer('size').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    table.index('taskId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('TaskAttachment');
}
