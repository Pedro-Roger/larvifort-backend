import { Provider } from '@nestjs/common';
import knex, { Knex } from 'knex';
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */
const knexConfigFile: Record<
  string,
  Knex.Config
> = require('../../../knexfile');
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment */

export const KNEX = 'KNEX';

// Knex reservado a: migrations/seeds + queries pesadas read-only do Dashboard.
// Proibido em CRUD transacional (esse é papel do Prisma via Repository).
export const knexProvider: Provider = {
  provide: KNEX,
  useFactory: (): Knex => {
    const env =
      process.env.NODE_ENV === 'test'
        ? 'test'
        : process.env.NODE_ENV === 'production'
          ? 'production'
          : 'development';
    return knex(knexConfigFile[env] ?? knexConfigFile.development);
  },
};
