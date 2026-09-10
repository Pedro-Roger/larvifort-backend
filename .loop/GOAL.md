# GOAL - Lavifort API (Backend)

## Objetivo

Completar a API REST do CRM Larvifort com qualidade de produção.

## ✅ Já Implementado

- Configuração NestJS
- Database Module (Prisma + Knex)
- Schema Prisma completo (Users, Teams, Clients, Companies, Tasks, Appointments)
- Filtros HTTP
- Auth Guard / Roles Guard
- bcrypt password hashing (cost 12)
- Pagination helper (core/common/pagination.ts)
- Testes unitários e E2E

### FASE 1 - Autenticação (Prioridade Alta)

- [x] Módulo Auth: login, register, logout, profile/me com JWT guard
- [x] Refresh token: endpoint POST /auth/refresh implementado (valida token, revoga antigo, retorna novo access token)

### FASE 2 - Core CRUD (Prioridade Alta)

- [x] Users Module: CRUD completo + PATCH /users/me
- [x] Clients Module: CRUD com filtros (status, responsável, empresa, cidade), alias /clientes, berçário, 404/409
- [x] Companies Module: CRUD completo + Grupos Comerciais, alias /empresas e /grupos

### FASE 3 - Features (Prioridade Média)

- [x] Tasks Module (Kanban) ✅
  - [x] GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id
  - [x] PATCH /tasks/:id/status, PATCH /tasks/:id/progresso, PATCH /tasks/:id/mover
  - [x] Projects CRUD (dentro do módulo tasks)
- [x] Appointments Module (Agenda) ✅
  - [x] GET /appointments, POST /appointments, PATCH /appointments/:id, DELETE /appointments/:id
  - [x] GET /appointments/calendario?mes=YYYY-MM
  - [x] Aliases /appointments e /compromissos
- [x] Users Module extension: PATCH /api/v1/users/me ✅
  - [x] Apenas firstName, lastName, email (sem role, sem password)
  - [x] Protegido por JwtAuthGuard com @CurrentUser('id')
- [x] Teams Module (SPECS TASK 02) ✅
  - [x] GET /teams, POST /teams, PATCH /teams/:id, DELETE /teams/:id
  - [x] POST /teams/:id/members (add user to team)
  - [x] DELETE /teams/:id/members/:userId (remove user from team)

### FASE 3.5 - Próximas Features (Prioridade Média)

- [x] Dashboard Module (SPECS TASK 08)
  - [x] GET /dashboard/resumo (stats: totalClientes, clientesAtivos, taxaConversao, receitaTotal, ticketMedio, vendasMes, metaValor, metaVolume)
  - [x] GET /dashboard/frequencia-visitas (barras: cliente x visitas)
  - [x] GET /dashboard/atividade-clientes (tabela: cliente, ultimaVisita, proximaVisita, status)
  - [x] GET /dashboard/taxa-vendas (taxaConversao, ticketMedio)
  - [x] GET /dashboard/metas (valorAtual x valorMeta, metaVolume)
  - [x] GET /dashboard/workload (cards por user: tarefas abertas/em andamento)
- [x] Field Searches Module - Pesquisas de Campo (SPECS TASK 07)
  - [x] CRUD /api/v1/pesquisas?cliente=&somenteLarvifort=&de=&ate=&page=&limit=
  - [x] GET /api/v1/pesquisas/:id (detalhe c/ cliente+responsável)
  - [x] DTO: clienteId*, dataPesquisa, responsavelId?, larvas[]* (≥1), maioriaLarvifort*, parouLarvifort, motivosSaida[] (exigido se parou), outroMotivo (se motivos contém OUTRO), uniformidadeBercario|Cultivo (OTIMA|BOA|REGULAR|RUIM)?, sobrevBercario|Cultivo 0-100?, resultadosUltimoCiclo?, observacoes?
  - [x] Regras: larvas ≥ 1 item (400), parouLarvifort=true exige ≥1 motivo, % fora de 0-100 → 400

### FASE 4 - Infraestrutura (Prioridade Baixa)

- [x] Paginação helper (core/common/pagination.ts) ✅
- [x] Validação com class-validator (em todos os DTOs) ✅
- [x] Testes E2E (66 suites unit 217/217 + 12 e2e 109/109) ✅
- [x] Filtros HTTP (P2002→409, P2025→404) ✅
- [x] Auth Guard / Roles Guard ✅
- [x] bcrypt password hashing ✅
- [x] Swagger/OpenAPI docs ✅
- [x] Rate limiting (@nestjs/throttler) ✅
- [x] Logging estruturado (pino/winston) ✅

### BUG FIXES

- [x] Corrigir erro preexistente em test files auth para full build (tsc --noEmit)
  - Fixed: remover findById de mocks em get-profile.usecase.spec.ts, login.usecase.spec.ts, register.usecase.spec.ts
  - Fixed: adicionar mocks de PasswordHasherPort e RefreshTokenPort no login.usecase.spec.ts

## Critérios de Conclusão

- [x] Auth JWT operacional
- [x] Testes passando (66 suites unit 217/217 + 12 e2e 109/109)
- [x] Build passa (sem limitações - tsc --noEmit ok, 212 testes passing)
- [x] Swagger documentado

## Comandos de Verificação

```bash
npm run build
npm run lint
npm test
```

## Restrições

- Não acessar Prisma fora de *.prisma.repository.ts
- Usar DTOs para validação
- Retornar status HTTP corretos
- Não expor dados sensíveis
- Usar pipes e guards do NestJS

## Arquivos Importantes Modificados

- `src/modules/tasks/` - TASK 06 (Kanban completo)
- `src/modules/appointments/` - TASK 05 (Agenda completa)
- `src/modules/users/` - TASK 02b (PATCH /users/me)
- `src/modules/teams/` - TASK 02 (Teams Module + Membros)
- `src/modules/auth/` - Refresh token endpoint
- `src/app.module.ts` - Wire de módulos
- `test/` - testes unitários e E2E para todos os módulos

## Próximos Passos Prioritários

1. [x] **Fix auth test files** - Corrigir erros TypeScript em testes do módulo auth (findById em mocks, mocks de dependências) - Concluído em 2026-09-07
2. [x] **Dashboard Module** - 6 endpoints read-only com agregações reais e cache de 60s para vendas/metas - Concluído em 2026-09-08
3. [x] **Field Searches Module** - CRUD /pesquisas com validações complexas (larvas, motivos, %) - Concluído em 2026-09-08
4. [x] **Swagger/OpenAPI** - Configuração `/api/docs`, Bearer JWT, metadados e testes - Concluído em 2026-09-08

### FASE 5 - Módulo de Projetos inspirado no UPSprint

- [ ] API-003: Projetos com colunas persistidas e CRUD real
- [ ] API-004: Tarefas orientadas por `columnId`, com compatibilidade temporária de `status`
- [ ] API-005: Regras personalizadas por usuário/equipe/cargo e coluna
- [ ] API-006: Automações por evento, condições, ações, retries e histórico
- [ ] API-007: Templates de projeto opt-in
- [ ] API-008: Migração segura e remoção definitiva de mocks/fallbacks
