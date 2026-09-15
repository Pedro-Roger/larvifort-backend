import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTipo = await knex.schema.hasColumn('Task', 'tipo');
  const hasAppointmentId = await knex.schema.hasColumn(
    'Task',
    'appointmentId',
  );
  const hasClienteId = await knex.schema.hasColumn('Task', 'clienteId');

  if (!hasTipo) {
    await knex.schema.alterTable('Task', (t) => {
      t.text('tipo').notNullable().defaultTo('GERAL');
      t.index(['tipo']);
    });
  }
  if (!hasAppointmentId) {
    await knex.schema.alterTable('Task', (t) => {
      t.text('appointmentId').nullable().unique();
      t.foreign('appointmentId').references('Appointment.id').onDelete('SET NULL');
      t.index(['appointmentId']);
    });
  }
  if (!hasClienteId) {
    await knex.schema.alterTable('Task', (t) => {
      t.text('clienteId').nullable();
      t.foreign('clienteId').references('Cliente.id').onDelete('SET NULL');
      t.index(['clienteId']);
    });
  }

  const hasConfirmationTable = await knex.schema.hasTable('TaskActivityConfirmation');
  if (!hasConfirmationTable) {
    await knex.schema.createTable('TaskActivityConfirmation', (t) => {
      t.text('id').primary().defaultTo(knex.raw('gen_random_uuid()::text'));
      t.text('taskId').notNullable().unique();
      t.foreign('taskId').references('Task.id').onDelete('CASCADE');
      t.text('confirmedById').notNullable();
      t.foreign('confirmedById').references('User.id').onDelete('CASCADE');
      t.timestamp('confirmedAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.double('latitude').notNullable();
      t.double('longitude').notNullable();
      t.double('accuracyMeters').notNullable();
      t.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.index(['taskId']);
      t.index(['confirmedById']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('TaskActivityConfirmation');

  const hasAppointmentId = await knex.schema.hasColumn(
    'Task',
    'appointmentId',
  );
  const hasClienteId = await knex.schema.hasColumn('Task', 'clienteId');
  const hasTipo = await knex.schema.hasColumn('Task', 'tipo');

  if (hasAppointmentId) {
    await knex.schema.alterTable('Task', (t) => {
      t.dropColumn('appointmentId');
    });
  }
  if (hasClienteId) {
    await knex.schema.alterTable('Task', (t) => {
      t.dropColumn('clienteId');
    });
  }
  if (hasTipo) {
    await knex.schema.alterTable('Task', (t) => {
      t.dropColumn('tipo');
    });
  }
}
