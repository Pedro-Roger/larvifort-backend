# LarviFort — projetos, quadros, regras e automações

## Objetivo

Evoluir o módulo de tarefas para uma experiência próxima ao módulo de Projetos
do UPSprint, sem copiar complexidade desnecessária e sem usar dados mockados.
Cada quadro será um recurso real, configurável, auditável e isolado.

## Decisões

- Um quadro possui suas próprias colunas persistidas.
- Nenhum quadro, coluna, regra ou automação é criado silenciosamente como
  fallback do frontend.
- A criação exige pelo menos uma coluna; templates são explícitos e opt-in.
- Tarefas referenciam uma coluna real. O status atual será legado durante a
  migração, não a fonte definitiva do Kanban.
- Regras controlam permissões; automações executam ações após eventos.
- Master tem precedência global; Admin e User respeitam as regras do quadro.

## Fases

1. Projetos, colunas, CRUD, ordenação e criação guiada.
2. Regras de acesso por quadro e por coluna.
3. Automações por evento, condições, ações, retries e histórico.
4. Templates e telas avançadas de configuração.

## Não objetivos iniciais

Não reproduzir sprints, Mercos, Git, WhatsApp e dashboards avançados do
UPSprint antes de validar o núcleo do CRM. Não permitir código arbitrário em
regras ou automações.

## Requisitos transversais

Autenticação e escopo em toda rota; auditoria de mutações; erros estáveis para o
frontend; idempotência para eventos repetidos; testes unitários, integração e
e2e para caminhos permitidos e negados.
