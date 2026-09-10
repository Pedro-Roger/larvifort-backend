# Loop Log

Formato por iteracao: `YYYY-MM-DD | TASK-ID | PASS/FAIL/BLOCKED | resumo curto`

2026-09-07 | API-001 | PASS | Implementar Field Searches /pesquisas - CRUD module with validations (larvas≥1, parouLarvifort→motivos, sobrevivência 0-100)
2026-09-08 | API-001 | PASS | Corrigido feedback do verifier: Prisma/Knex FieldSearch reais, validações HTTP, joins cliente/responsável, testes unitários/E2E e gates completos; verify.sh PASS
2026-09-08 | API-002 | PASS | Dashboard passou a usar agregações Prisma reais, atividade/frequência/workload derivados do banco e cache de 60s para vendas/metas; 261 testes e verify.sh PASS
2026-09-08 | API-003 | PASS | Swagger/OpenAPI em `/api/docs` com Bearer JWT, tags de controllers, DTOs documentados; 263 testes e verify.sh PASS
2026-09-08 | API-004 | PASS | Rate limiting global via @nestjs/throttler (100 req/min), ThrottlerGuard global aplicado a todos endpoints; 263 testes e verify.sh PASS
2026-09-08 | API-005 | PASS | Logging estruturado via nestjs-pino (autoLogging, serializers, JSON/produção, pretty/desenvolvimento); 263 testes e verify.sh PASS
2026-09-09 | E2E-FIX | PASS | Correção dos testes E2E (providers em Companies/Tasks, mock de findById em Auth Profile, @nestjs/config para Nest 11); 78 unit suites (263/263) e 14 E2E suites (128/128) PASS
2026-09-09 | API-006 | PASS | Projetos com colunas persistidas e CRUD real (Prisma ProjetoColumn, criação atômica, endpoints /projects/:id/columns, reorder, update, delete); 84 unit suites (286/286) e 14 E2E suites (133/133) PASS
2026-09-09 | API-007 | PASS | Tarefas orientadas por columnId (validação inter-projeto das colunas em tasks.controller/usecases, DTOs query/update flexíveis, assignment de coluna fallback = default[0]); 84 unit suites (290/290) e 14 E2E suites (133/133) PASS
