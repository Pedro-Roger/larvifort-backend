# GOAL - Lavifort API (Backend)

## Objetivo

Completar a API REST do CRM Larvifort com qualidade de produção.

## ✅ Já Implementado

- Configuração NestJS
- Configuração Prisma + PostgreSQL
- Configuração Knex (migrations)
- Database Module
- App Controller/Service básico
- Schema Prisma completo (Users, Teams, Clients, Companies, Tasks, Appointments)
- Filtros HTTP

## 📋 Tasks Pendentes

### Prioridade Alta

- [ ] Implementar módulo de Autenticação (JWT)
  - [ ] POST /auth/login
  - [ ] POST /auth/register
  - [ ] POST /auth/logout
  - [ ] GET /auth/profile
  - [ ] Refresh token

- [ ] Implementar módulo de Usuários
  - [ ] GET /users
  - [ ] GET /users/:id
  - [ ] POST /users
  - [ ] PATCH /users/:id
  - [ ] DELETE /users/:id

- [ ] Implementar módulo de Clientes (Leads)
  - [ ] GET /clients
  - [ ] GET /clients/:id
  - [ ] POST /clients
  - [ ] PATCH /clients/:id
  - [ ] DELETE /clients/:id
  - [ ] Filtros por status, responsável, empresa

### Prioridade Média

- [ ] Implementar módulo de Empresas
  - [ ] GET /companies
  - [ ] GET /companies/:id
  - [ ] POST /companies
  - [ ] PATCH /companies/:id
  - [ ] DELETE /companies/:id

- [ ] Implementar módulo de Tarefas (Kanban)
  - [ ] GET /tasks
  - [ ] POST /tasks
  - [ ] PATCH /tasks/:id
  - [ ] DELETE /tasks/:id
  - [ ] PATCH /tasks/:id/status (mover no kanban)

- [ ] Implementar módulo de Compromissos (Agenda)
  - [ ] GET /appointments
  - [ ] POST /appointments
  - [ ] PATCH /appointments/:id
  - [ ] DELETE /appointments/:id

- [ ] Implementar Paginação
  - [ ] Criar helper de paginação
  - [ ] Aplicar em todos os endpoints de listagem

### Prioridade Baixa

- [ ] Implementar sistema de Permissões (RBAC)
- [ ] Adicionar rate limiting
- [ ] Implementar logging estruturado
- [ ] Adicionar documentação Swagger/OpenAPI
- [ ] Implementar testes E2E
- [ ] Adicionar validações com class-validator

## Critérios de Conclusão

- [ ] Todos os endpoints funcionando
- [ ] Autenticação JWT operacional
- [ ] Testes passando
- [ ] Build passa
- [ ] Lint passa
- [ ] Documentação Swagger publicada

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