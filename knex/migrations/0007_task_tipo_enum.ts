import type { Knex } from 'knex';

const TIPO_TASK_VALUES = ['GERAL', 'COMPROMISSO'] as const;

export async function up(knex: Knex): Promise<void> {
  const enumType = await knex.raw<{ rows: Array<{ exists: boolean }> }>(
    `SELECT EXISTS (
       SELECT 1
       FROM pg_type
       WHERE typnamespace = 'public'::regnamespace
         AND typname = 'TipoTask'
     ) AS exists`,
  );

  if (!enumType.rows[0]?.exists) {
    const values = TIPO_TASK_VALUES.map((value) => `'${value}'`).join(', ');
    await knex.raw(`CREATE TYPE "TipoTask" AS ENUM (${values})`);
  }

  const tipoColumn = await knex.raw<{
    rows: Array<{ udt_name: string }>;
  }>(
    `SELECT udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'Task'
       AND column_name = 'tipo'`,
  );

  if (tipoColumn.rows[0]?.udt_name === 'text') {
    await knex.raw('ALTER TABLE "Task" ALTER COLUMN "tipo" DROP DEFAULT');
    await knex.raw(
      'ALTER TABLE "Task" ALTER COLUMN "tipo" TYPE "TipoTask" USING "tipo"::text::"TipoTask"',
    );
    await knex.raw(
      'ALTER TABLE "Task" ALTER COLUMN "tipo" SET DEFAULT \'GERAL\'::"TipoTask"',
    );
  }
}

export async function down(knex: Knex): Promise<void> {
  const tipoColumn = await knex.raw<{
    rows: Array<{ udt_name: string }>;
  }>(
    `SELECT udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'Task'
       AND column_name = 'tipo'`,
  );

  if (tipoColumn.rows[0]?.udt_name === 'TipoTask') {
    await knex.raw('ALTER TABLE "Task" ALTER COLUMN "tipo" DROP DEFAULT');
    await knex.raw(
      'ALTER TABLE "Task" ALTER COLUMN "tipo" TYPE text USING "tipo"::text',
    );
    await knex.raw(
      'ALTER TABLE "Task" ALTER COLUMN "tipo" SET DEFAULT \'GERAL\'::text',
    );
  }

  await knex.raw('DROP TYPE IF EXISTS "TipoTask"');
}
