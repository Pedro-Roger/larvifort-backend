# Architecture

## Stack

- **Runtime**: Node.js 20
- **Framework**: NestJS 11 (TypeScript strict)
- **ORM**: Prisma 6/7 (runtime)
- **Migrations**: Knex 3
- **Database**: PostgreSQL 16
- **Authentication**: JWT (access 15min + refresh 7d)
- **Validation**: class-validator
- **HTTP**: Express under NestJS
- **Testing**: Jest + Supertest
- **Container**: Docker

## Boundaries

- **Domain**: Pure entities, no Nest/Prisma dependencies
- **Application**: Use cases with interfaces, no Prisma/Knex
- **Infra**: PrismaService, Knex, mappers, database connections
- **Presentation**: Controllers + DTOs with class-validator
- **Module per feature**: Each business entity (Cliente, GrupoComercial, Compromisso) has its own module

## Rules

- Flow obligatoire: Controller → UseCase → RepositoryInterface → PrismaRepository → PG
- PROIBIDO PrismaService, knex ou SQL em *.controller.ts, *.usecase.ts, *.service.ts
- PROIBIDO importar @prisma/client fora de infra/*.prisma.repository.ts, core/database/* e core/filters/*
- Controller: valida DTO, chama 1 usecase, retorna DTO (máx ~60 linhas)
- Migrations e dados de produção são de alto risco - nunca commitar sem revisão
- Segredos nunca devem ser commiteados
- Nomes de negócio em PT-BR espelham o front (Cliente, GrupoComercial, Compromisso)
- Respostas paginadas via core/common/pagination.ts
- Prefixo API: /api/v1

## Projetos e Kanban

- `ProjetoColuna` é recurso persistido por `Projeto`; `Task.columnId` será a
  fonte do Kanban durante a migração do status legado.
- Regras são decisões de autorização; automações são consumidores de eventos.
- Criação de projeto com colunas é transacional; automações são idempotentes,
  auditáveis e não podem entrar em ciclos.
