# lavifort-API

> Memória do projeto para o OpenCode (`AGENTS.md` = equivalente ao `CLAUDE.md` do Claude Code).
> Convertido de `~/.vibe-coding-toolkit/templates/CLAUDE.md.template`. Curto e high-signal.
> Specs por agente: `docs/SPECS.md`. Schema canônico: `prisma/schema.prisma`.

## Behavioral guidelines

1. **Think before coding** — explicite premissas. Se houver múltiplas interpretações, apresente-as em vez de escolher em silêncio. Se algo estiver genuinamente incerto, pare e pergunte.
2. **Simplicity first** — código mínimo que resolve o problema. Sem features especulativas, sem abstrações para uso único, sem configurabilidade não pedida.
3. **Surgical changes** — toque só o que o pedido exige. Siga o estilo existente. Não refatore nem "melhore" código adjacente fora do escopo.
4. **Goal-driven execution** — transforme tarefas em metas verificáveis. Para trabalho multi-step, apresente um plano breve com verificação por etapa e só avance com cada etapa verde.
5. **Orchestrator, not implementer** — a sessão principal planeja, decide e coordena; não implementa. Implementação delegável vai para subagente especialista (via Task tool), em paralelo quando os escopos não conflitam (sem dependência entre tarefas da mesma onda, sem sobreposição de arquivos).

## Stack

TypeScript strict · NestJS 11 · Prisma 6/7 (ORM de runtime) · Knex (migrations/seeds) · PostgreSQL 16 · JWT (access 15min + refresh 7d) · class-validator · Jest + Supertest · npm

## Canonical commands

Sempre use estes comandos exatos — não adivinhe.

- **Install:** `npm install`
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Test:** `npm test -- <modulo>`
- **Test e2e:** `npm run test:e2e -- <modulo>`
- **Coverage:** `npm run test:cov -- <modulo>` (mínimo 80% no módulo)
- **Build:** `npm run build`
- **Run/Dev:** `npm run start:dev`
- **DB up:** `npm run db:up` (`docker compose up -d postgres`)
- **Prisma:** `npx prisma generate` · `npm run prisma:migrate`
- **Knex:** `npm run knex:migrate` · `npm run knex:seed`

## Specialist agent routing table

Quando o trabalho for delegável, despache o especialista correspondente em vez de fazer inline. Mapeamento para as skills deste ambiente (invoque com a Skill tool antes de agir; `explore`/`general` via Task tool quando for delegar):

| Agent | Quando usar | Skill / subagente |
|---|---|---|
| `orchestrator` | Tarefa multi-domínio ou ondas paralelas de subagentes | `dispatching-parallel-agents` + Task `general` |
| `code-reviewer` | Após editar qualquer fonte — bugs, segurança, cobertura | `code-review` / `requesting-code-review` |
| `security-reviewer` | Antes de merge mexendo em auth, inputs ou secrets | `code-review` (eixo Standards) |
| `test-engineer` | Testes unit/e2e com disciplina TDD após nova lógica | `tdd` / `test-driven-development` |
| `backend-specialist` | Endpoints, usecases, repositories, persistência | Task `general` + convenções abaixo |
| `debugger` | Bug, falha de teste ou comportamento inesperado | `systematic-debugging` / `diagnosing-bugs` |
| `planner` | Transformar pedido aberto em plano antes de codar | `brainstorming` → `writing-plans` → `to-tickets` |

## Conventions

Arquitetura por módulo (`src/modules/<modulo>/`): `domain/` (entidades puras, sem Nest/Prisma) · `application/` (usecases, sem Prisma/Knex) · `infra/` (único lugar com `PrismaService`/Knex + mappers) · `presentation/` (controller + DTOs com `class-validator`) · `<modulo>.module.ts` (wiring).

Fluxo obrigatório: `Controller → UseCase → RepositoryInterface → PrismaRepository → PG`.

**Regra eliminatória do Repository:** PROIBIDO `PrismaService`, `knex` ou SQL em `*.controller.ts`, `*.usecase.ts`, `*.service.ts`. PROIBIDO importar `@prisma/client` fora de `infra/*.prisma.repository.ts`, `core/database/*` e `core/filters/*`. Controller: valida DTO, chama 1 usecase, retorna DTO (máx ~60 linhas).

**Bateria de testes (gate de toda task, nesta ordem):** `tsc --noEmit` → `lint` → `unit` (usecase com repository mockado) → `e2e` (feliz + 404 + 409 + 401) → `coverage ≥ 80%`. Sem verde, sem done.

Erros: `P2002→409`, `P2025→404` (filtro global). Respostas paginadas via `core/common/pagination.ts`. Prefixo API: `/api/v1`. Nomes de negócio em PT-BR espelham o front (`Cliente`, `GrupoComercial`, `Compromisso`).

## Learn more

Seções acima vêm do template do vibe-coding-toolkit. Raciocínio de cada peça em `~/.vibe-coding-toolkit/docs/` (playbook: `docs/02-playbook-onboarding.md`; subagentes: `docs/tools/02-subagent-orchestration.md`; quality gates: `docs/tools/06-eslint-biome-quality-gates.md`).
