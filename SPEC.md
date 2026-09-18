# Product Specification

## Project

lavifort-API

## Goal

Construir a API backend do LarviFort CRM, um CRM 360 para escritório administrativo com foco em operação, auditoria, automações, metas, métricas e quantificação do trabalho da equipe.

A API deve ser a fonte confiável dos dados operacionais: clientes, empresas, contatos, agenda, visitas, reuniões, pedidos, tarefas, subtarefas, quadro, metas, métricas, responsáveis, regras, automações e histórico de execução.

O objetivo principal é permitir que a plataforma mostre o que cada pessoa está fazendo, quando está fazendo, como está fazendo, para qual cliente ou pedido, com qual resultado e com qual evidência. O backend deve garantir consistência, rastreabilidade e segurança para que o frontend não dependa de mocks, dados artificiais ou regras duplicadas.

## Requirements

- A API deve seguir REST com prefixo `/api/v1`.
- A API deve usar NestJS com TypeScript, camadas separadas e DTOs validados.
- A persistência deve usar PostgreSQL, Prisma para acesso a dados e migrations controladas.
- A autenticação deve proteger rotas operacionais e retornar `401` para requisições sem token válido.
- O domínio deve usar nomes de negócio em PT-BR quando fizer sentido: Cliente, Empresa, Compromisso, Pedido, Tarefa, Projeto, Meta, Métrica.
- O backend deve centralizar regras de negócio, evitando que o frontend precise inventar cálculos críticos.
- Tarefas, compromissos, pedidos e metas devem ter dados suficientes para auditoria: responsável, data, status, vínculo, histórico e contexto.
- Criar visita ou reunião deve permitir vínculo com agenda e quadro operacional.
- Criar pedido deve registrar cliente, itens, quantidade, entrega, endereço, observação, valor e vínculo com tarefa/card quando configurado.
- O módulo de tarefas deve suportar quadro, colunas, responsáveis, subtarefas, progresso, vínculos com compromissos e vínculos com pedidos.
- O módulo de métricas deve expor dados reais para comparações operacionais, como visitas, pedidos, clientes atendidos, atividades e desempenho por período.
- O módulo de metas deve permitir acompanhar objetivos com base em dados verificáveis do sistema.
- Regras e automações devem ser configuráveis, idempotentes e auditáveis, sem ciclos automáticos perigosos.
- A API deve retornar estados vazios honestos e dados reais; não deve produzir dados fictícios para parecer que há movimento.
- A API deve manter paginação, filtros e ordenação em endpoints de listagem relevantes.
- Produção, migrations e dados reais devem ser tratados como alto risco.
- Segredos, tokens, dumps e arquivos sensíveis não devem ser commitados.

## Acceptance Criteria

- O backend compila sem erros com `npm run build`.
- A suíte relevante de testes passa antes de publicar mudanças críticas.
- Rotas protegidas sem token retornam `401 Token ausente` ou resposta equivalente de autenticação.
- Endpoints expostos pela API usam prefixo `/api/v1`.
- Endpoints de listagem relevantes suportam paginação ou retorno estruturado compatível com o frontend.
- Cliente, empresa, compromisso, pedido, tarefa, quadro, meta e métrica não devem depender de dados mockados no backend.
- Criar visita ou reunião deve persistir compromisso com dados suficientes para aparecer na agenda e gerar atividade no quadro quando o fluxo pedir.
- Criar pedido deve persistir cliente, itens, quantidade, valor total, entrega e contexto operacional.
- Pedido vinculado a tarefa deve expor `orderId`, `orderNumber` e `orderTotal` para o frontend exibir no card e totalizar coluna.
- Tarefas com subtarefas devem expor dados suficientes para cálculo de progresso e auditoria.
- Métricas devem ser derivadas de fontes reais do sistema e permitir comparação entre os mesmos conjuntos de dados quando aplicável.
- Regras e automações devem ser testáveis, rastreáveis e não devem gerar loops infinitos.
- Nenhuma controller deve acessar Prisma, Knex ou SQL diretamente; controllers chamam use cases ou serviços de aplicação.
- Use cases não devem depender de detalhes de Prisma ou SQL direto.
- Migrations devem ser revisadas e executadas com backup quando envolverem produção.
- Alterações publicadas no backend devem ser validadas em endpoint real, não apenas por push no Git.
