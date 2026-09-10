# Product Specification

## Project

lavifort-API

## Goal

A backend API for lavifort management system providing CRUD operations for business entities (Clientes, GrupoComercial, Compromisso) with authentication, authorization, and pagination support.

## Requirements

- API must follow REST conventions with prefix /api/v1
- Use NestJS 11 with TypeScript strict mode
- Data persistence via Prisma ORM with PostgreSQL 16
- Authentication using JWT (access token 15min, refresh token 7d)
- Input validation with class-validator
- Pagination via core/common/pagination.ts
- Business names in PT-BR: Cliente, GrupoComercial, Compromisso
- No PrismaService, knex, or raw SQL in controllers, usecases, or services
- Mandatory test battery: tsc --noEmit → lint → unit → e2e → coverage ≥ 80%

## Acceptance Criteria

- GET /api/v1/clientes returns paginated list with 200 status
- POST /api/v1/clientes with valid DTO creates resource with 201 status
- GET /api/v1/clientes/:id with valid ID returns 200, invalid ID returns 404
- PUT /api/v1/clientes/:id with valid ID and DTO updates resource with 200 status
- DELETE /api/v1/clientes/:id with valid ID returns 204 status
- Unauthenticated requests to protected routes return 401
- Duplicate email/CPF registration returns 409
- All unit and e2e tests pass with ≥ 80% coverage
- TypeScript compilation passes with no errors
- ESLint passes with no errors
