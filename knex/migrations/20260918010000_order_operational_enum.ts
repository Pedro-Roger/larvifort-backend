import type { Knex } from 'knex';

const VALUES = [
  'RASCUNHO',
  'AGUARDANDO_ESTOQUE',
  'ESTOQUE_RESERVADO',
  'AGUARDANDO_CONFIRMACION',
  'CONFIRMADO',
  'FECHADO',
  'CANCELADO',
  'AGUARDANDO_SEPARACAO',
  'AGUARDANDO_MOTORISTA',
] as const;

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('Order', 'operationalStatus');
  if (!hasColumn) return;

  const typeResult = await knex.raw<{ rows: Array<{ exists: boolean }> }>(
    `SELECT EXISTS (
       SELECT 1 FROM pg_type
       WHERE typnamespace = 'public'::regnamespace
         AND typname = 'OrderOperationalStatus'
     ) AS exists`,
  );

  if (!typeResult.rows[0]?.exists) {
    const literals = VALUES.map((value) => `'${value}'`).join(', ');
    await knex.raw(
      `CREATE TYPE "OrderOperationalStatus" AS ENUM (${literals})`,
    );
  }

  await knex.raw(
    `ALTER TABLE "Order"
       ALTER COLUMN "operationalStatus" DROP DEFAULT;
     ALTER TABLE "Order"
       ALTER COLUMN "operationalStatus" TYPE "OrderOperationalStatus"
       USING "operationalStatus"::text::"OrderOperationalStatus";
     ALTER TABLE "Order"
       ALTER COLUMN "operationalStatus" SET DEFAULT 'RASCUNHO'::"OrderOperationalStatus"`,
  );
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('Order', 'operationalStatus');
  if (!hasColumn) return;

  await knex.raw(
    `ALTER TABLE "Order"
       ALTER COLUMN "operationalStatus" DROP DEFAULT;
     ALTER TABLE "Order"
       ALTER COLUMN "operationalStatus" TYPE text
       USING "operationalStatus"::text;
     ALTER TABLE "Order"
       ALTER COLUMN "operationalStatus" SET DEFAULT 'RASCUNHO'`,
  );
  await knex.raw('DROP TYPE IF EXISTS "OrderOperationalStatus"');
}
