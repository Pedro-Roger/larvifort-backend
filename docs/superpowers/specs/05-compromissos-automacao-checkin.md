# Spec 05 — compromissos, cards automáticos e confirmação com check-in

## Objetivo

Integrar Agenda e Kanban sem dados simulados. Um compromisso novo deve apontar
para um cliente cadastrado. Uma automação opt-in define em qual coluna real do
quadro será criado o card correspondente. O card de compromisso pode ser
confirmado uma única vez, registrando usuário, data/hora do servidor e
geolocalização enviada pelo dispositivo.

## Fonte de clientes

- O seletor de `Novo compromisso` consome exclusivamente `GET /clients`.
- Cada opção envia um `clienteId` real; IDs de `Empresa` não podem ser enviados
  no campo `clienteId`.
- `clienteId` é obrigatório para novos compromissos deste fluxo. Registros
  antigos com vínculo nulo permanecem válidos para leitura.
- `empresaId` permanece apenas para compatibilidade com dados existentes. A API
  não deriva nem substitui silenciosamente `clienteId` por `empresaId`.
- A criação valida a existência do cliente e retorna `404` quando ele não
  existir. A resposta inclui o cliente necessário para exibir nome e contato.

## Card de compromisso

`Task` passa a distinguir `GERAL` e `COMPROMISSO`. Uma task de compromisso tem:

- `tipo = COMPROMISSO`;
- `appointmentId` obrigatório e único;
- `clienteId` obrigatório;
- título derivado da atividade/compromisso;
- descrição com data, horário, endereço e observações disponíveis;
- `projetoId` e `columnId` definidos pela automação que a criou.

As relações com `Appointment` e `Cliente` são persistidas. A resposta de task
expõe os dados mínimos do compromisso e do cliente; o frontend não reconstrói
essas relações por nome. Excluir ou editar o compromisso não pode gerar um
segundo card. A política inicial mantém o card para auditoria caso o compromisso
seja excluído, preservando um resumo imutável dos dados usados na criação.

## Automação de entrada

Adicionar o gatilho `APPOINTMENT_CREATED` e a ação
`CREATE_APPOINTMENT_TASK`. A ação exige `targetColumnId`, pertencente ao mesmo
projeto da automação.

Ao criar um compromisso, a API publica o evento depois da persistência. O
worker encontra automações ativas para o gatilho, valida a coluna e cria uma
task por automação configurada. A chave idempotente inclui compromisso e
automação, impedindo duplicação em retry. Projetos distintos podem optar pelo
gatilho; isso só cria mais de um card quando houver mais de uma automação ativa
configurada de forma explícita.

Falha da automação não desfaz o compromisso. Ela fica no histórico de execução
com erro sanitizado e segue a política existente de retry/backoff. Coluna
arquivada, inexistente ou de outro projeto bloqueia a ativação/teste da
automação.

## Confirmação da atividade

Criar `TaskActivityConfirmation` com relação um-para-um com `Task` e os campos:
`id`, `taskId`, `confirmedById`, `confirmedAt`, `latitude`, `longitude`,
`accuracyMeters` e `createdAt`.

Endpoint autenticado:

`POST /tasks/:id/confirm-activity`

Payload:

```json
{
  "latitude": -3.7319,
  "longitude": -38.5267,
  "accuracyMeters": 18.4
}
```

Regras:

- somente task `COMPROMISSO` pode ser confirmada;
- data e hora oficiais vêm do servidor no momento da confirmação;
- latitude deve estar entre `-90` e `90`, longitude entre `-180` e `180`, e
  precisão deve ser positiva;
- a permissão segue as regras do quadro; por padrão, responsável da task e
  `ADMIN` podem confirmar;
- a primeira confirmação é persistida atomicamente; repetição retorna `409` e
  nunca sobrescreve usuário, horário ou localização;
- confirmar não move a task nem altera progresso automaticamente.

A API retorna a confirmação anexada ao detalhe da task. Não há rastreamento em
segundo plano: somente a coordenada enviada na ação explícita de confirmar é
armazenada.

## Contratos e compatibilidade

- Estender DTOs, domínio, ports, repositórios e Swagger nos módulos envolvidos.
- O fluxo `POST /appointments` continua respondendo sem aguardar ações
  assíncronas demoradas.
- Tasks existentes recebem `tipo = GERAL` por default e não exibem confirmação.
- Migrations Knex preservam dados e criam índices/uniques para
  `appointmentId` e `taskId`.
- Respostas e eventos usam IDs; nomes são somente projeções de leitura.

## Segurança e privacidade

- Coordenadas só são aceitas de usuário autenticado e autorizado.
- Não registrar coordenadas completas em logs, alertas ou mensagens de erro.
- A precisão deve ser persistida para deixar explícita a qualidade do check-in.
- A API não faz geocodificação reversa nem monitoramento contínuo nesta fase.

## Critérios de aceite

1. Criar compromisso com cliente real persiste `clienteId` válido.
2. Empresa enviada como `clienteId` é rejeitada; não existe fallback de ID.
3. Automação ativa cria um card `COMPROMISSO` na coluna configurada com cliente
   e atividade.
4. Retry do mesmo evento não duplica card.
5. Sem automação ativa, o compromisso é criado sem card e sem erro.
6. Confirmação válida grava usuário, horário do servidor, coordenadas e precisão.
7. Segunda confirmação retorna `409` e preserva o registro original.
8. Task geral, usuário sem permissão ou coordenada inválida não confirma.
9. Unitários, integração e e2e cobrem os contratos, e o módulo mantém cobertura
   mínima de 80%.

