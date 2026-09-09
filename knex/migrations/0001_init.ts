import type { Knex } from 'knex';

// TASK 00e — Knex dono da DDL (Prisma = runtime ORM).
// Espelha prisma/schema.prisma (nomes de tabelas/colunas idênticos ao
// default do Prisma: model name como tabela, field name como coluna).
// Idempotente: usa createTableIfNotExists + dropTableIfExists.
// Enums via enu() sem useNative (TEXT + CHECK), sem tipos nativos p/ rollback simples.

// ---------- Enums (espelham schema.prisma) ----------
const ROLE = ['ADMIN', 'USER'] as const;
const STATUS_LEAD = [
  'NOVO',
  'SEM_CONTATO',
  'EM_NEGOCIACAO',
  'CLIENTE_ATIVO',
] as const;
const STATUS_EMPRESA = ['ATIVA', 'PROSPECT', 'INATIVA'] as const;
const TIPO_COMPROMISSO = ['REUNIAO', 'VISITA'] as const;
const STATUS_TAREFA = [
  'BACKLOG',
  'EM_ANDAMENTO',
  'EM_REVISAO',
  'CONCLUIDO',
] as const;
const PRIORIDADE = ['ALTA', 'MEDIA', 'BAIXA'] as const;
const UNIFORMIDADE = ['OTIMA', 'BOA', 'REGULAR', 'RUIM'] as const;

function uuidPk(table: Knex.CreateTableBuilder, knex: Knex): void {
  table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
}

function tz(
  table: Knex.CreateTableBuilder,
  column: string,
): Knex.ColumnBuilder {
  return table.timestamp(column, { useTz: true });
}

function timestamps(table: Knex.CreateTableBuilder, knex: Knex): void {
  tz(table, 'createdAt').notNullable().defaultTo(knex.fn.now());
  tz(table, 'updatedAt').notNullable().defaultTo(knex.fn.now());
}

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTableIfNotExists('Team', (t) => {
    uuidPk(t, knex);
    t.text('name').notNullable().unique();
    timestamps(t, knex);
  });

  await knex.schema.createTableIfNotExists('User', (t) => {
    uuidPk(t, knex);
    t.text('firstName').notNullable();
    t.text('lastName').notNullable();
    t.text('email').notNullable().unique();
    t.text('passwordHash').notNullable();
    t.enu('role', [...ROLE], {
      useNative: false,
      existingType: false,
      enumName: 'User_role',
    })
      .notNullable()
      .defaultTo('USER');
    t.boolean('active').notNullable().defaultTo(true);
    t.uuid('teamId').nullable();
    t.foreign('teamId').references('Team.id').onDelete('SET NULL');
    timestamps(t, knex);
  });

  await knex.schema.createTableIfNotExists('RefreshToken', (t) => {
    uuidPk(t, knex);
    t.uuid('userId').notNullable();
    t.foreign('userId').references('User.id').onDelete('CASCADE');
    t.text('tokenHash').notNullable().unique();
    tz(t, 'expiresAt').notNullable();
    t.boolean('revoked').notNullable().defaultTo(false);
    tz(t, 'createdAt').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTableIfNotExists('GrupoComercial', (t) => {
    uuidPk(t, knex);
    t.text('name').notNullable().unique();
    t.text('color').notNullable().defaultTo('#0ea5e9');
    timestamps(t, knex);
  });

  await knex.schema.createTableIfNotExists('Empresa', (t) => {
    uuidPk(t, knex);
    t.text('name').notNullable();
    t.text('cnpj').nullable().unique();
    t.text('city').nullable();
    t.enu('status', [...STATUS_EMPRESA], {
      useNative: false,
      existingType: false,
      enumName: 'Empresa_status',
    })
      .notNullable()
      .defaultTo('PROSPECT');
    t.uuid('grupoId').nullable();
    t.foreign('grupoId').references('GrupoComercial.id').onDelete('SET NULL');
    timestamps(t, knex);
    t.index(['grupoId']);
    t.index(['status']);
  });

  await knex.schema.createTableIfNotExists('Cliente', (t) => {
    uuidPk(t, knex);
    t.text('firstName').notNullable();
    t.text('lastName').notNullable();
    t.text('email').nullable();
    t.text('phone').nullable();
    tz(t, 'birthdate').nullable();
    t.text('cpfCnpj').nullable().unique();
    t.enu('statusLead', [...STATUS_LEAD], {
      useNative: false,
      existingType: false,
      enumName: 'Cliente_statusLead',
    })
      .notNullable()
      .defaultTo('NOVO');
    t.text('origem').nullable();
    t.text('pais').nullable().defaultTo('Brasil');
    t.text('cidade').nullable();
    t.text('uf').nullable();
    t.text('endereco').nullable();
    t.text('observacoes').nullable();
    t.uuid('empresaId').nullable();
    t.foreign('empresaId').references('Empresa.id').onDelete('SET NULL');
    t.double('laminaAgua').nullable();
    t.integer('qtdViveiros').nullable();
    t.double('densidade').nullable();
    t.double('producaoMedia').nullable();
    t.boolean('temBercario').notNullable().defaultTo(false);
    t.integer('qtdBercarios').nullable();
    t.double('volumeBercarios').nullable();
    t.boolean('alimentadorAutomatico').notNullable().defaultTo(false);
    timestamps(t, knex);
    t.index(['statusLead']);
    t.index(['cidade']);
    t.index(['empresaId']);
  });

  await knex.schema.createTableIfNotExists('Projeto', (t) => {
    uuidPk(t, knex);
    t.text('name').notNullable().unique();
    timestamps(t, knex);
  });

  await knex.schema.createTableIfNotExists('Appointment', (t) => {
    uuidPk(t, knex);
    t.enu('tipo', [...TIPO_COMPROMISSO], {
      useNative: false,
      existingType: false,
      enumName: 'Appointment_tipo',
    }).notNullable();
    t.text('titulo').notNullable();
    tz(t, 'data').notNullable();
    t.text('horario').nullable();
    t.text('endereco').nullable();
    t.text('observacoes').nullable();
    t.uuid('clienteId').nullable();
    t.foreign('clienteId').references('Cliente.id').onDelete('SET NULL');
    t.uuid('empresaId').nullable();
    t.foreign('empresaId').references('Empresa.id').onDelete('SET NULL');
    t.uuid('ownerId').nullable();
    t.foreign('ownerId').references('User.id').onDelete('SET NULL');
    timestamps(t, knex);
    t.index(['data']);
    t.index(['tipo']);
    t.index(['clienteId']);
    t.index(['empresaId']);
  });

  await knex.schema.createTableIfNotExists('Task', (t) => {
    uuidPk(t, knex);
    t.uuid('projetoId').notNullable();
    t.foreign('projetoId').references('Projeto.id').onDelete('CASCADE');
    t.text('titulo').notNullable();
    t.text('descricao').nullable();
    t.enu('status', [...STATUS_TAREFA], {
      useNative: false,
      existingType: false,
      enumName: 'Task_status',
    })
      .notNullable()
      .defaultTo('BACKLOG');
    t.enu('prioridade', [...PRIORIDADE], {
      useNative: false,
      existingType: false,
      enumName: 'Task_prioridade',
    })
      .notNullable()
      .defaultTo('MEDIA');
    t.integer('progresso').notNullable().defaultTo(0);
    t.specificType('tags', 'text[]').notNullable().defaultTo('{}');
    tz(t, 'prazo').nullable();
    t.double('estimativaH').nullable();
    t.uuid('assigneeId').nullable();
    t.foreign('assigneeId').references('User.id').onDelete('SET NULL');
    timestamps(t, knex);
    t.index(['projetoId', 'status']);
    t.index(['assigneeId']);
  });

  await knex.schema.createTableIfNotExists('FieldSearch', (t) => {
    uuidPk(t, knex);
    t.uuid('clienteId').notNullable();
    t.foreign('clienteId').references('Cliente.id').onDelete('CASCADE');
    tz(t, 'dataPesquisa').notNullable().defaultTo(knex.fn.now());
    t.uuid('responsavelId').nullable();
    t.foreign('responsavelId').references('User.id').onDelete('SET NULL');
    t.specificType('larvas', 'text[]').notNullable().defaultTo('{}');
    t.boolean('maioriaLarvifort').notNullable().defaultTo(false);
    t.boolean('parouLarvifort').notNullable().defaultTo(false);
    t.specificType('motivosSaida', 'text[]').notNullable().defaultTo('{}');
    t.text('outroMotivo').nullable();
    t.enu('uniformidadeBercario', [...UNIFORMIDADE], {
      useNative: false,
      existingType: false,
      enumName: 'FieldSearch_uniformidadeBercario',
    }).nullable();
    t.enu('uniformidadeCultivo', [...UNIFORMIDADE], {
      useNative: false,
      existingType: false,
      enumName: 'FieldSearch_uniformidadeCultivo',
    }).nullable();
    t.double('sobrevBercario').nullable();
    t.double('sobrevCultivo').nullable();
    t.text('resultadosUltimoCiclo').nullable();
    t.text('observacoes').nullable();
    timestamps(t, knex);
    t.index(['clienteId']);
    t.index(['dataPesquisa']);
  });

  await knex.schema.createTableIfNotExists('Sale', (t) => {
    uuidPk(t, knex);
    t.uuid('vendedorId').notNullable();
    t.foreign('vendedorId').references('User.id').onDelete('CASCADE');
    t.uuid('clienteId').nullable();
    t.foreign('clienteId').references('Cliente.id').onDelete('SET NULL');
    t.double('valor').notNullable();
    tz(t, 'data').notNullable().defaultTo(knex.fn.now());
    tz(t, 'createdAt').notNullable().defaultTo(knex.fn.now());
    t.index(['vendedorId', 'data']);
  });

  await knex.schema.createTableIfNotExists('Meta', (t) => {
    uuidPk(t, knex);
    t.uuid('vendedorId').notNullable();
    t.foreign('vendedorId').references('User.id').onDelete('CASCADE');
    t.text('mes').notNullable();
    t.double('metaValor').notNullable();
    t.integer('metaVolume').notNullable();
    tz(t, 'createdAt').notNullable().defaultTo(knex.fn.now());
    tz(t, 'updatedAt').notNullable().defaultTo(knex.fn.now());
    t.unique(['vendedorId', 'mes']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Meta');
  await knex.schema.dropTableIfExists('Sale');
  await knex.schema.dropTableIfExists('FieldSearch');
  await knex.schema.dropTableIfExists('Task');
  await knex.schema.dropTableIfExists('Appointment');
  await knex.schema.dropTableIfExists('Projeto');
  await knex.schema.dropTableIfExists('Cliente');
  await knex.schema.dropTableIfExists('Empresa');
  await knex.schema.dropTableIfExists('GrupoComercial');
  await knex.schema.dropTableIfExists('RefreshToken');
  await knex.schema.dropTableIfExists('User');
  await knex.schema.dropTableIfExists('Team');
}
