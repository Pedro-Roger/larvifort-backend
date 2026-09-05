# Lavifort-API — SPECS por agente (MD único, cada spec = 1 task)

> Stack: NestJS 11 + Prisma 6 (ORM runtime) + Knex (migrations/seeds) + PostgreSQL 16 + JWT.
> Telas de referência: `../larvifort-crm/src` (Login, Dashboard, Clientes, Empresas, Agenda, Kanban, Pesquisa, Equipe, Perfil).
> Schema canônico: `prisma/schema.prisma`. Prefixo API: `/api/v1`.

## 0. Convenções duras (valem para TODAS as tasks)

### 0.1 Clean Architecture por módulo
```
src/modules/<modulo>/
  domain/            # entidades + interfaces puras (SEM imports Nest/Prisma)
  application/       # usecases/services (regra de negócio, SEM Prisma/Knex)
  infra/             # *.prisma.repository.ts (ÚNICO lugar com PrismaService/Knex) + mappers
  presentation/      # *.controller.ts + dto/* (class-validator)
  <modulo>.module.ts # wiring: controller + usecase + { provide: TOKEN, useClass: PrismaRepo }
```
Fluxo obrigatório: `Controller → UseCase → RepositoryInterface → PrismaRepository → PG`.

### 0.2 Regra do Repository (eliminatória no review)
- **PROIBIDO** `PrismaService`, `knex` ou SQL em `*.controller.ts`, `*.usecase.ts`, `*.service.ts`.
- **PROIBIDO** importar `@prisma/client` fora de `infra/*.prisma.repository.ts`, `core/database/*` e `core/filters/*`.
- Todo acesso a banco passa por `XxxRepository` (interface em `domain/` ou `application/ports/`, implementação `PrismaXxxRepository` em `infra/`).
- Controller: só valida DTO, chama 1 usecase, retorna DTO. Máx ~60 linhas.
- UseCase: só orquestra regra + chama repository. Sem `where/select/include` Prisma no corpo.

### 0.3 Componentização / Clean Code
- Reutilizar `core/common/pagination.ts`, `core/filters/http.filters.ts`, `core/database/*`.
- DTOs com `class-validator`; entidades de domínio puras; mappers `toDomain/toPersistence` no repository.
- Nomes PT-BR de negócio espelham o front (`Cliente`, `GrupoComercial`, `Compromisso`, `Pesquisa`); nomes técnicos em inglês (`controller`, `usecase`, `repository`).
- Erros de domínio: `NotFoundException`, `ConflictException`, `BadRequestException`. `P2002→409`, `P2025→404` já cobertos pelo filtro.

### 0.4 Bateria de testes — GATE obrigatório de cada agente
Nenhuma task é "done" sem, **nesta ordem**:
1. `npx tsc --noEmit` verde
2. `npm run lint` verde
3. `npm test -- <modulo>` — unit de usecase (repository mockado) + unit de repository (integração leve ou mock Prisma)
4. `npm run test:e2e -- <modulo>` — CRUD feliz + 404 + 409 + 401 (quando houver auth) via Supertest
5. `npm run test:cov -- <modulo>` — **coverage ≥ 80%** no módulo
- Falhou qualquer item → corrigir antes de marcar a task como concluída. Anexar no PR/commit o log resumido.

### 0.5 Ordem de execução
`00 → 01 → 02 → (03, 04, 05, 06, 07 em paralelo) → 08`. Task 08 (Dashboard) consome dados das anteriores.

---

## Tasks (marcar `[x]` ao concluir com a bateria verde)

- [ ] **TASK 00 — Agente `core-db`: fundação, Docker, Prisma generate + Knex base** — Base: nenhuma tela (sustenta todas). Fazer: (a) validar `docker-compose.yml`, `knexfile.js`, `.env`, `prisma/schema.prisma` já criados no scaffold; (b) criar `knex/migrations/0001_init.ts` espelhando o schema (Knex é dono da DDL) e `knex/seeds/01_base.ts` (teams Marketing/Técnico/Comercial + 6 users Fernando/Ana/Marcos/Juliana/Pedro/Luciana + 2 grupos + 3 empresas + projeto "LarviFort CRM"); (c) criar `src/core/auth/jwt-auth.guard.ts` + `roles.guard.ts` + `current-user.decorator.ts` (esqueleto usado pela TASK 01); (d) `GET /api/v1/health` retornando `{status:"ok"}`. Arquivos: `knex/migrations/*`, `knex/seeds/*`, `src/core/auth/*`, health no `AppController`. Testes: e2e health + boot do DatabaseModule + `knex migrate:latest`/`migrate:rollback` idempotente em banco de teste. DoD: `db:up + prisma generate + knex migrate + seed` sobe do zero; bateria §0.4 verde.

- [ ] **TASK 01 — Agente `auth`: login, refresh, me** — Tela base: `src/app/page.tsx` (E-mail + Senha + Entrar). Endpoints: `POST /api/v1/auth/login {email,senha} → {accessToken, refreshToken, user}`, `POST /api/v1/auth/refresh {refreshToken} → {accessToken}`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` (guard). Regras: bcrypt (cost 12), `RefreshToken` hash SHA-256 + `revoked`, access 15min / refresh 7d via `JwtModule`, `GET /me` sem vazar `passwordHash`. Camadas: `AuthController → AuthUseCase (login/refresh/logout/me) → UserRepository + RefreshTokenRepository` (interfaces próprias; impl Prisma em `infra/`). Testes: unit login ok/senha errada/refresh revogado + e2e login→me→refresh→logout→me 401. DoD: front consegue logar com `roberto@larvifort.com.br`; bateria §0.4 verde.

- [ ] **TASK 02 — Agente `teams-users`: Equipe, Membros e Perfil** — Telas: `src/app/(app)/equipe/page.tsx` (times, membros, perfil Admin/User, senha padrão) e `perfil/page.tsx`. Endpoints: `CRUD /api/v1/teams`, `POST /api/v1/teams/:id/members`, `DELETE /api/v1/teams/:id/members/:userId`, `GET/PATCH /api/v1/users/me`, `GET /api/v1/users?search=&teamId=&page=&limit=`. Regras: email único (409), `DELETE team` não apaga users (`SetNull`), só ADMIN cria team/promove role, `PATCH /me` nunca altera `role`. Repository: `TeamRepository`, `UserRepository` (paginado + search nome/email). Front espera: stack de avatares, `N membros`, badge Admin/User. Testes: unit troca de role proibida p/ USER + e2e CRUD team + add/remove member + paginação. DoD: espelha os 3 times mockados; bateria §0.4 verde.

- [ ] **TASK 03 — Agente `empresas`: Grupos Comerciais + Empresas** — Tela: `src/app/(app)/empresas/page.tsx` (tabs Grupos/Todas, cards com sigla/CNPJ/cidade/status, modais Novo Grupo/Nova Empresa, busca). Endpoints: `CRUD /api/v1/grupos`, `CRUD /api/v1/empresas?grupoId=&status=&search=&page=&limit=`, `GET /api/v1/grupos/:id/empresas`. Regras: nome de grupo único, CNPJ único quando informado (409), `DELETE grupo` faz `SetNull` nas empresas, status ∈ `ATIVA|PROSPECT|INATIVA`. Repository: `GrupoRepository`, `EmpresaRepository` (filtro grupo+status+search). Testes: unit CNPJ duplicado + e2e CRUD grupo→empresa→busca→delete grupo preserva empresa. DoD: reproduz grupos Coopercitrus/NutriVale/Santa Fé; bateria §0.4 verde.

- [ ] **TASK 04 — Agente `clientes`: Clientes/Contatos + dados piscicultura** — Tela: `src/app/(app)/clientes/page.tsx` + `NovoContatoModal.tsx` (todos os campos abaixo são obrigatórios no DTO). Endpoints: `CRUD /api/v1/clientes?status=&search=&cidade=&page=&limit=`, `PATCH /api/v1/clientes/:id/status`. DTO create: `firstName, lastName, email?, phone?, birthdate?, cpfCnpj?, statusLead(NOVO|SEM_CONTATO|EM_NEGOCIACAO|CLIENTE_ATIVO), origem?, pais?, cidade?, uf?, endereco?, observacoes?, empresaId?, laminaAgua?, qtdViveiros?, densidade?, producaoMedia?, temBercario?, qtdBercarios?, volumeBercarios?, alimentadorAutomatico?`. Regras: `cpfCnpj` único (409), coerência berçário (`temBercario=false` zera qtd/volume), tabs do front viram filtro `status`. Repository: `ClienteRepository` (paginado + filtros + search nome/email/cidade). Testes: unit berçário incoerente + e2e create tabela→filtro status→paginhação `01 a 10 de 97`→409 cpf. DoD: 5 linhas mock do front cadastráveis; bateria §0.4 verde.

- [ ] **TASK 05 — Agente `agenda`: Compromissos (Reuniões/Visitas)** — Tela: `src/app/(app)/agenda/page.tsx` + modal Novo Compromisso. Endpoints: `CRUD /api/v1/compromissos?tipo=&de=&ate=&clienteId=&empresaId=&page=&limit=`, `GET /api/v1/compromissos/calendario?mes=YYYY-MM` (agrupado por dia p/ dots do calendário). DTO: `tipo(REUNIAO|VISITA), titulo, clienteId?, empresaId?, data, horario?, endereco?(obrigatório se VISITA), observacoes?, ownerId?`. Regras: ao menos `clienteId` ou `empresaId`, sem compromisso no passado via POST (400), VISITA exige endereço. Repository: `CompromissoRepository` (range de datas + agrupamento calendário). Testes: unit visita-sem-endereço 400 + e2e create→filtro tipo→calendário do mês→delete. DoD: calendário mensal do front alimentável; bateria §0.4 verde.

- [ ] **TASK 06 — Agente `kanban`: Projetos, Tarefas e movimentação** — Telas: `src/app/(app)/kanban/page.tsx` + `KanbanCard/Column/QuickEditDrawer` (+ workload do Dashboard). Endpoints: `CRUD /api/v1/projetos`, `CRUD /api/v1/tarefas?projetoId=&status=&assigneeId=&search=`, `PATCH /api/v1/tarefas/:id/mover {status, ordem?}`, `PATCH /api/v1/tarefas/:id/progresso {progresso}`. DTO tarefa: `projetoId, titulo, descricao?, status(BACKLOG|EM_ANDAMENTO|EM_REVISAO|CONCLUIDO), prioridade(ALTA|MEDIA|BAIXA), progresso 0-100, tags[]≤5, prazo?, estimativaH?, assigneeId?`. Regras: `progresso=100` ⇒ `status=CONCLUIDO` (e vice-versa), mover valida transição, `tags` deduplicadas. Repository: `ProjetoRepository`, `TarefaRepository` (board por projeto+status). Testes: unit auto-conclusão + e2e drag-and-drop via mover→drawer edit→board filtrado. DoD: 4 colunas + seletor de projeto funcionais; bateria §0.4 verde.

- [ ] **TASK 07 — Agente `pesquisas`: Pesquisas de campo** — Tela: `src/app/(app)/pesquisa/page.tsx` + `NovaPesquisaModal.tsx` + modal detalhe. Endpoints: `CRUD /api/v1/pesquisas?cliente=&somenteLarvifort=&de=&ate=&page=&limit=`, `GET /api/v1/pesquisas/:id` (detalhe c/ cliente+responsável). DTO: `clienteId*, dataPesquisa, responsavelId?, larvas[]* (≥1), maioriaLarvifort*, parouLarvifort, motivosSaida[] (exigido se parou), outroMotivo (se motivos contém OUTRO), uniformidadeBercario|Cultivo (OTIMA|BOA|REGULAR|RUIM)?, sobrevBercario|Cultivo 0-100?, resultadosUltimoCiclo?, observacoes?`. Regras: `larvas` ≥ 1 item (400), `parouLarvifort=true` exige ≥1 motivo, `%` fora de 0-100 → 400. Repository: `PesquisaRepository` (filtros + join cliente). Testes: unit motivos-obrigatórios + e2e create→filtro Larvifort→detalhe→delete (confirm do front). DoD: chips Larvifort + cores de sobrevivência calculáveis; bateria §0.4 verde.

- [ ] **TASK 08 — Agente `dashboard`: agregações read-only (única exceção Knex)** — Tela: `src/app/(app)/dashboard/page.tsx` + `SalesRate/GoalChart/VisitChart/FrequencySection/ClientActivityTable/WorkloadCard/ListView`. Endpoints (todos `GET`, sem write): `/api/v1/dashboard/resumo?tarefas`, `/api/v1/dashboard/frequencia-visitas`, `/api/v1/dashboard/atividade-clientes`, `/api/v1/dashboard/taxa-vendas`, `/api/v1/dashboard/metas`, `/api/v1/dashboard/workload`. Regras: **somente leitura**; permitido Knex/queryBuilder ou `prisma.$queryRaw` **apenas dentro de `infra/*.dashboard.repository.ts`**; nunca tocar tabelas de escrita; cache em memória 60s p/ metas/vendas; payloads com os mesmos nomes que o front usa (`totalClientes, clientesAtivos, taxaConversao, receitaTotal, ticketMedio, vendasMes, metaValor, metaVolume`, barras `cliente x visitas`, `valorAtual x valorMeta`). Repository: `DashboardRepository` (1 método por endpoint). Testes: unit matemática (taxa/ticket/%meta) + e2e cada endpoint com seed da TASK 00 + teste de que nenhum endpoint faz INSERT/UPDATE. DoD: dashboard renderiza só com API; bateria §0.4 verde.

## Critério de aceite global
Todas as 9 tasks `[x]`, `tsc+lint` verdes, `test:cov` global ≥ 80%, `docker compose up + knex migrate + seed` reproduzível, nenhum `prisma.`/`knex(` fora de `infra/` e `core/` (verificar com `rg "prisma\.|knex\(" src --glob '!**/infra/**' --glob '!**/core/**'` retornando vazio).
