# Stock Reservations and Status Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o contrato de status de unidades/locais no CRM e expor a listagem autenticada de reservas com os dados necessários para a tela operacional.

**Architecture:** A API preservará `ACTIVA | INACTIVA` como contrato canônico de estoque. A listagem de reservas seguirá `Controller → ListReservationsUseCase → StockInventoryRepositoryPort → PrismaStockInventoryRepository`, usando um read model enriquecido sem acesso ao Prisma fora de `infra`. O CRM continuará normalizando respostas em `src/services`, agora usando os valores canônicos e solicitando somente reservas ativas.

**Tech Stack:** NestJS 11, TypeScript strict, Prisma, class-validator, Jest/Supertest, Next.js 16, React 19.

---

## File map

### API (`lavifort-API`)
- Create `src/modules/stock/application/list-reservations.usecase.ts`: normaliza paginação e delega a listagem.
- Create `src/modules/stock/presentation/dto/list-reservations-query.dto.ts`: valida `productId`, `orderId`, `status`, `page` e `limit`.
- Modify `src/modules/stock/domain/stock-reservation.ts`: adiciona o read model enriquecido.
- Modify `src/modules/stock/application/ports/stock-inventory-repository.port.ts`: tipa `listReservations` com o read model.
- Modify `src/modules/stock/infra/stock-inventory.prisma.repository.ts`: carrega reservas e enriquece produto, unidade, local e pedido.
- Modify `src/modules/stock/presentation/stock-reservations.controller.ts`: adiciona `GET /stock/reservations`.
- Modify `src/modules/stock/stock.module.ts`: registra `ListReservationsUseCase`.
- Modify `src/modules/stock/application/stock-inventory.usecases.spec.ts`: cobre paginação/filtros do novo use case.
- Modify `test/stock-inventory.e2e-spec.ts`: cobre 401 e resposta enriquecida do GET.
- Create `src/modules/stock/infra/stock-inventory.prisma.repository.spec.ts`: cobre o enriquecimento e ausência segura de vínculos opcionais.

### CRM (`../larvifort-crm`)
- Modify `src/services/stockUnits.ts`: usa tipos/status canônicos e payload sem `code`.
- Modify `src/services/reservations.ts`: usa status canônico e filtra reservas ativas.
- Modify `src/app/(app)/estoque/unidades/page.tsx`: envia/exibe `ACTIVA` corretamente.
- Create `src/services/stockUnits.test.ts`: testa normalização canônica.
- Create `src/services/reservations.test.ts`: testa normalização e URL com filtro ativo.

## Task 1: API — contrato e caso de uso de listagem

- [ ] Escrever testes unitários que esperam `ListReservationsUseCase.execute()` delegar `{ status: 'ACTIVA', page: 1, limit: 20 }` e limitar `limit` a 100.
- [ ] Rodar `npm test -- stock-inventory.usecases.spec.ts` e confirmar falha pela ausência do use case.
- [ ] Criar `StockReservationListItem`, `ListReservationsUseCase` e `ListReservationsQueryDto`.
- [ ] Adicionar `@Get()` ao controller e registrar o provider no módulo.
- [ ] Rodar novamente o teste unitário e confirmar sucesso.

## Task 2: API — projeção Prisma enriquecida

- [ ] Escrever teste do repositório com reservas, produtos, locais, unidades e pedidos mockados.
- [ ] Confirmar que o teste falha porque a listagem ainda retorna apenas IDs.
- [ ] Fazer `listReservations()` consultar em lote os IDs distintos e retornar `orderNumber`, `productName`, `unit`, `unitName` e `locationName`, usando strings vazias/null quando o vínculo opcional não existir.
- [ ] Ordenar reservas por `createdAt: 'desc'` e preservar filtros/paginação existentes.
- [ ] Rodar o teste do repositório e confirmar sucesso.

## Task 3: API — contrato HTTP

- [ ] Adicionar e2e de `GET /api/v1/stock/reservations?status=ACTIVA` sem token, esperando 401.
- [ ] Adicionar e2e autenticado esperando 200 e os campos enriquecidos.
- [ ] Rodar `npm run test:e2e -- stock-inventory`.
- [ ] Rodar `npx tsc --noEmit`, `npm run lint`, `npm test -- stock`, `npm run test:cov -- stock` e `npm run build`, registrando falhas preexistentes separadamente.

## Task 4: CRM — alinhar status e consumo

- [ ] Criar testes para `normalizeUnit`, `normalizeLocation`, `normalizeReservation` e `fetchReservations()`.
- [ ] Confirmar que os testes falham para fallback/URL antigos (`ACTIVE` e rota sem filtro).
- [ ] Definir status de unidade/local como `ACTIVA | INACTIVA`, remover `code` do payload de criação/edição e usar `city` opcional.
- [ ] Alterar a tela para enviar `ACTIVA` e apresentar `ACTIVA` como “Ativa”.
- [ ] Definir status de reserva como `ACTIVA | CANCELADA | CONSUMIDA` e buscar `/stock/reservations?status=ACTIVA`.
- [ ] Rodar os testes de serviço direcionados.
- [ ] Rodar `npm run typecheck`, `npm run lint` e `npm run build` no CRM, preservando as alterações preexistentes não relacionadas.

## Task 5: revisão integrada

- [ ] Revisar o diff da API contra arquitetura e requisitos.
- [ ] Revisar o diff do CRM para confirmar que contratos permanecem em `src/services`.
- [ ] Confirmar que nenhum segredo, migration ou alteração de produção foi incluído.
- [ ] Informar os arquivos alterados, comandos executados e qualquer gate bloqueado por falha preexistente.
