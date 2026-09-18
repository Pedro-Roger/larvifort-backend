import type { Knex } from 'knex';

// TASK 00f — Seed base idempotente (Knex dono da DDL/seeds, Prisma = runtime ORM).
// Conteúdo mínimo da TASK 00 (SPECS.md): teams Marketing/Técnico/Comercial +
// 6 users + 2 grupos + 3 empresas + projeto "LarviFort CRM".
// Idempotente: upsert via onConflict onde há unique (Team.name, User.email,
// GrupoComercial.name, Projeto.name); Empresa (sem unique de nome) insere só
// os nomes ausentes. Re-runnable sem apagar dados. Não exige DB em tsc/lint/build.

// Senha demo: Lavifort@123. Hash bcrypt cost 12 para permitir login local
// sem armazenar senha em texto puro no banco.
const DEMO_PASSWORD_HASH =
  '$2b$12$XoAIzn3EBSrs4cm9FQ7ft.qu.re9s5CR/0Kw33Fobpdh1flUKrH9K';

const TEAMS = [{ name: 'Marketing' }, { name: 'Técnico' }, { name: 'Comercial' }];

const USERS = [
  {
    firstName: 'Fernando',
    lastName: 'Santos',
    email: 'fernando@lavifort.com.br',
    role: 'ADMIN',
    teamName: 'Comercial',
  },
  {
    firstName: 'Ana',
    lastName: 'Paula',
    email: 'ana@lavifort.com.br',
    role: 'USER',
    teamName: 'Marketing',
  },
  {
    firstName: 'Marcos',
    lastName: 'Silva',
    email: 'marcos@lavifort.com.br',
    role: 'USER',
    teamName: 'Técnico',
  },
  {
    firstName: 'Juliana',
    lastName: 'Menezes',
    email: 'juliana@lavifort.com.br',
    role: 'USER',
    teamName: 'Comercial',
  },
  {
    firstName: 'Pedro',
    lastName: 'Roger',
    email: 'pedro@lavifort.com.br',
    role: 'ADMIN',
    teamName: 'Técnico',
  },
  {
    firstName: 'Luciana',
    lastName: 'Gomes',
    email: 'luciana@lavifort.com.br',
    role: 'USER',
    teamName: 'Comercial',
  },
];

const GRUPOS = [
  { name: 'Coopercitrus', color: '#10b981' },
  { name: 'NutriVale', color: '#0ea5e9' },
];

const EMPRESAS = [
  {
    name: 'Fazenda Rio Grande Ltda',
    cnpj: '12345678000199',
    city: 'Rifaina',
    status: 'ATIVA',
    grupoName: 'Coopercitrus',
  },
  {
    name: 'Agropecuária Santa Fé',
    cnpj: '98765432000188',
    city: 'Franca',
    status: 'PROSPECT',
    grupoName: 'NutriVale',
  },
  {
    name: 'Produtor Independente Silva',
    cnpj: null,
    city: 'Pedregulho',
    status: 'ATIVA',
    grupoName: null,
  },
];

const DEFAULT_PROJECT_COLUMNS = [
  { title: 'Backlog', order: 0, color: '#64748b' },
  { title: 'Em Andamento', order: 1, color: '#0ea5e9' },
  { title: 'Em Revisão', order: 2, color: '#f59e0b' },
  { title: 'Concluído', order: 3, color: '#10b981' },
];

// API-015 — Produtos iniciais para larvicultura (idempotente via code único).
const PRODUTOS = [
  { code: 'POS-LARVA', name: 'Pós-larva', unit: 'MILHEIRO', price: 150.0 },
  { code: 'MATRIZ', name: 'Matriz', unit: 'UN', price: 25.0 },
  { code: 'NAUPLIOS', name: 'Náuplios', unit: 'MILHEIRO', price: 80.0 },
];

// API-016 — Unidades productivas iniciales (idempotente via name único).
const STOCK_UNITS = [
  { name: 'Morada Nova', city: 'Morada Nova' },
  { name: 'Itarema', city: 'Itarema' },
];

export async function seed(knex: Knex): Promise<void> {
  for (const u of STOCK_UNITS) {
    await knex('StockUnit')
      .insert({ name: u.name, city: u.city, status: 'ACTIVA' })
      .onConflict('name')
      .merge({ city: u.city });
  }

  for (const p of PRODUTOS) {
    await knex('Product')
      .insert({
        code: p.code,
        name: p.name,
        unit: p.unit,
        price: p.price,
        isActive: true,
      })
      .onConflict('code')
      .merge({ name: p.name, unit: p.unit, price: p.price });
  }

  for (const t of TEAMS) {
    await knex('Team').insert(t).onConflict('name').merge();
  }
  const teams = await knex('Team').select('id', 'name');
  const teamIdByName = new Map<string, string>(
    teams.map((t: { id: string; name: string }) => [t.name, t.id]),
  );

  for (const u of USERS) {
    await knex('User')
      .insert({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: u.role,
        active: true,
        teamId: teamIdByName.get(u.teamName) ?? null,
      })
      .onConflict('email')
      .merge({
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        teamId: teamIdByName.get(u.teamName) ?? null,
      });
  }

  for (const g of GRUPOS) {
    await knex('GrupoComercial').insert(g).onConflict('name').merge();
  }
  const grupos = await knex('GrupoComercial').select('id', 'name');
  const grupoIdByName = new Map<string, string>(
    grupos.map((g: { id: string; name: string }) => [g.name, g.id]),
  );

  const existingEmpresas = await knex('Empresa').select('name');
  const existingNames = new Set<string>(
    existingEmpresas.map((e: { name: string }) => e.name),
  );
  for (const e of EMPRESAS) {
    if (existingNames.has(e.name)) {
      continue;
    }
    await knex('Empresa').insert({
      name: e.name,
      cnpj: e.cnpj,
      city: e.city,
      status: e.status,
      grupoId: e.grupoName ? (grupoIdByName.get(e.grupoName) ?? null) : null,
    });
    existingNames.add(e.name);
  }

  await knex('Projeto')
    .insert({ name: 'LarviFort CRM' })
    .onConflict('name')
    .merge();

  const project = await knex('Projeto')
    .where({ name: 'LarviFort CRM' })
    .first();

  if (project) {
    const existingCols = await knex('ProjetoColumn').where({
      projetoId: project.id,
    });
    if (existingCols.length === 0) {
      for (const col of DEFAULT_PROJECT_COLUMNS) {
        await knex('ProjetoColumn').insert({
          projetoId: project.id,
          title: col.title,
          order: col.order,
          color: col.color,
        });
      }
    }
  }
}
