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

const TEAMS = ['Marketing', 'Técnico', 'Comercial'] as const;

const USERS: Array<{
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  teamName: (typeof TEAMS)[number];
}> = [
  {
    firstName: 'Fernando',
    lastName: 'Silva',
    email: 'fernando@lavifort.com.br',
    role: 'ADMIN',
    teamName: 'Comercial',
  },
  {
    firstName: 'Roberto',
    lastName: 'Lima',
    email: 'roberto@larvifort.com.br',
    role: 'ADMIN',
    teamName: 'Comercial',
  },
  {
    firstName: 'Ana',
    lastName: 'Souza',
    email: 'ana@lavifort.com.br',
    role: 'USER',
    teamName: 'Marketing',
  },
  {
    firstName: 'Marcos',
    lastName: 'Oliveira',
    email: 'marcos@lavifort.com.br',
    role: 'USER',
    teamName: 'Técnico',
  },
  {
    firstName: 'Juliana',
    lastName: 'Costa',
    email: 'juliana@lavifort.com.br',
    role: 'USER',
    teamName: 'Comercial',
  },
  {
    firstName: 'Pedro',
    lastName: 'Santos',
    email: 'pedro@lavifort.com.br',
    role: 'ADMIN',
    teamName: 'Técnico',
  },
  {
    firstName: 'Luciana',
    lastName: 'Ferreira',
    email: 'luciana@lavifort.com.br',
    role: 'USER',
    teamName: 'Marketing',
  },
];

const GRUPOS = [
  { name: 'Coopercitrus', color: '#16a34a' },
  { name: 'NutriVale', color: '#0ea5e9' },
] as const;

const EMPRESAS: Array<{
  name: string;
  cnpj: string;
  city: string;
  status: 'ATIVA' | 'PROSPECT' | 'INATIVA';
  grupoName: (typeof GRUPOS)[number]['name'] | null;
}> = [
  {
    name: 'Fazenda Santa Fé',
    cnpj: '12.345.678/0001-90',
    city: 'Aracati',
    status: 'ATIVA',
    grupoName: 'Coopercitrus',
  },
  {
    name: 'AquaVale Ltda',
    cnpj: '98.765.432/0001-10',
    city: 'Russas',
    status: 'PROSPECT',
    grupoName: 'NutriVale',
  },
  {
    name: 'Camarões do Vale',
    cnpj: '11.222.333/0001-44',
    city: 'Morada Nova',
    status: 'PROSPECT',
    grupoName: null,
  },
];

export async function seed(knex: Knex): Promise<void> {
  for (const name of TEAMS) {
    await knex('Team').insert({ name }).onConflict('name').merge();
  }
  const teams = await knex('Team').select('id', 'name');
  const teamIdByName = new Map<string, string>(
    teams.map((t: { id: string; name: string }) => [t.name, t.id]),
  );

  for (const u of USERS) {
    const teamId = teamIdByName.get(u.teamName) ?? null;
    await knex('User')
      .insert({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: u.role,
        active: true,
        teamId,
      })
      .onConflict('email')
      .merge();
  }

  for (const g of GRUPOS) {
    await knex('GrupoComercial')
      .insert({ name: g.name, color: g.color })
      .onConflict('name')
      .merge();
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
}
