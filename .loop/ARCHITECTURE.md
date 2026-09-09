# Arquitetura Operacional do Loop

Este repositorio e uma unidade independente do loop global.

- `GOAL.md` define o resultado e os criterios de aceite.
- `ARCHITECTURE.md` define limites tecnicos.
- `TASKS.json` e a unica fila executavel; cada iteracao escolhe uma tarefa `pending`.
- `STATE.md` registra tarefa, verificacao e motivo de parada.
- `LOG.md` registra o historico das iteracoes.

O worker implementa uma tarefa coerente por iteracao. O reviewer so aprova com
evidencia de `scripts/verify.sh`. O loop para por `DONE`, `BLOCKED`, falha de
verificacao ou limite explicito de iteracoes.

Limites: manter NestJS, DTOs e guards existentes; acessar Prisma apenas por
repositorios; nao desabilitar testes nem mascarar erros de TypeScript.
