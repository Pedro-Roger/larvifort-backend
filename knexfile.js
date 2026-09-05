// Knex = DDL/migrations/seeds. Runtime ORM = Prisma. Não usar Knex em repositories de CRUD.
require('dotenv').config();

/** @type {import('knex').Knex.Config} */
const base = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://lavifort:lavifort@localhost:5432/lavifort',
  migrations: { directory: './knex/migrations', extension: 'ts' },
  seeds: { directory: './knex/seeds', extension: 'ts' },
};

module.exports = {
  development: base,
  test: { ...base, connection: process.env.DATABASE_URL_TEST || 'postgres://lavifort:lavifort@localhost:5432/lavifort_test' },
  production: base,
};
