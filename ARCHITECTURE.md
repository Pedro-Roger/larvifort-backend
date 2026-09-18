# Architecture

## Stack

- **Project:** `lavifort-API`
- **Runtime:** Node.js em container Docker.
- **Framework:** NestJS com TypeScript.
- **HTTP:** Express via NestJS.
- **Database:** PostgreSQL.
- **ORM:** Prisma para acesso principal a dados.
- **Migrations:** Knex/migrations controladas do projeto quando aplicável.
- **Auth:** JWT e guards em rotas operacionais.
- **Validation:** DTOs com `class-validator` e transformação controlada.
- **Testing:** Jest e Supertest para testes unitários/e2e.
- **Deployment:** VPS LarviFort em `/opt/larvifort`, serviço `lavifort-api`, exposto localmente em `127.0.0.1:3001->3000` e consumido pelo frontend via `/api/v1`.

## Product Role

Esta API é o núcleo do LarviFort CRM 360. Ela deve sustentar um escritório administrativo que precisa operar, auditar e quantificar o trabalho da equipe.

A API deve ser a fonte de verdade para:

- Clientes, empresas e contatos.
- Agenda, visitas, reuniões e compromissos.
- Pedidos, itens, valores e entregas.
- Tarefas, subtarefas, quadro, colunas e responsáveis.
- Metas, métricas, indicadores e comparações operacionais.
- Regras, automações, auditoria e histórico.

O frontend não deve precisar criar dados falsos ou regras paralelas para preencher telas. Quando não houver dados, a API deve permitir estados vazios honestos.

## Boundaries

- **Domain:** entidades e tipos de negócio sem dependência de Nest, Prisma ou HTTP.
- **Application:** casos de uso, regras de negócio e contratos de repositório.
- **Infra:** Prisma, Knex, mapeadores, banco de dados e integrações externas.
- **Presentation:** controllers, DTOs, validação, autenticação e resposta HTTP.
- **Core:** autenticação, filtros, paginação, banco, exceções, guards e utilitários comuns.

## Module Boundaries

- **Auth/Users/Teams:** identidade, equipe, permissões e responsáveis.
- **Clientes/Empresas:** cadastro, relacionamento e dados usados por agenda, pedidos e métricas.
- **Appointments/Agenda:** visitas, reuniões e compromissos com data, responsável e vínculo operacional.
- **Tasks/Kanban:** projetos, colunas, tarefas, subtarefas, progresso, responsáveis e vínculos com compromisso/pedido.
- **Orders/Pedidos:** pedidos, itens, valores, entrega, cliente e vínculo com tarefa/card.
- **Metrics/Goals:** dados agregados, comparações e metas baseadas em fontes reais.
- **Board Rules/Automations:** regras configuráveis e ações idempotentes sobre eventos do quadro.
- **Events/WebSocket:** atualização em tempo real quando disponível, sem substituir persistência.

## Rules

- Fluxo preferido: `Controller → UseCase/Application Service → Repository Port → Prisma Repository → PostgreSQL`.
- Controllers devem validar entrada, chamar aplicação e retornar resposta; não devem conter regra de negócio pesada.
- Não acessar Prisma, Knex ou SQL direto em controllers.
- Não importar detalhes de Prisma fora de infraestrutura, banco ou filtros explicitamente permitidos.
- Regras de domínio devem ficar em use cases, serviços de aplicação ou domínio, não no frontend.
- Dados de auditoria devem preservar responsável, data, status, vínculo e contexto sempre que a operação exigir rastreio.
- Automações devem ser idempotentes, auditáveis e protegidas contra ciclos.
- Migrations e dados de produção são alto risco: fazer backup antes de rodar em produção.
- Não commitar segredos, dumps, `.env` sensível ou tokens.
- Respostas paginadas devem seguir contrato comum e ser tolerantes para consumo do frontend.
- Erros devem ser claros e compatíveis com o frontend, sem vazar segredo ou stack trace em produção.
- Deploy real exige validar container, logs/health e endpoint protegido; push no Git não é deploy.

## Production Safety

- LarviFort backend fica separado da Aquafort.
- Antes de mexer no VPS, inventariar containers, portas e diretório correto.
- Para backend em produção, validar `/api/v1` com endpoint real após rebuild.
- Quando houver migration, criar backup do banco antes.
- Não parar/remover serviços de Aquafort para publicar LarviFort.
