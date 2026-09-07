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

### FASE 4 - Infraestrutura (Prioridade Baixa)

- [x] Paginação helper (core/common/pagination.ts) ✅
- [x] Validação com class-validator (em todos os DTOs) ✅
- [x] Testes E2E (66 suites unit 217/217 + 12 e2e 109/109) ✅
- [x] Filtros HTTP (P2002→409, P2025→404) ✅
- [x] Auth Guard / Roles Guard ✅
- [x] bcrypt password hashing ✅
- [ ] Swagger/OpenAPI docs ❌
- [ ] Rate limiting (@nestjs/throttler) ❌
- [ ] Logging estruturado (pino/winston) ❌

## Critérios de Conclusão

- [x] Auth JWT operacional
- [x] Testes passando (66 suites unit 217/217 + 12 e2e 109/109)
- [x] Build passa (com limitações conhecidas)
- [ ] Swagger documentado

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
- `src/app.module.ts` - Wire de módulos
- `test/` - testes unitários e E2E para todos os módulos