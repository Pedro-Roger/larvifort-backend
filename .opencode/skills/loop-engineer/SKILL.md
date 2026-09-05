# Loop Engineering Skill

## Descrição

Esta skill implementa o padrão Loop Engineering para desenvolvimento autônomo e iterativo.

## Quando usar

Use esta skill quando:
- Quiser automatizar o ciclo de implementação → verificação → correção
- Precisar de um sistema estruturado para desenvolvimento iterativo
- Quiser garantir qualidade através de verificações independentes

## Como funciona

1. **GOAL.md** define os requisitos e critérios de conclusão
2. **STATE.md** mantém o estado persistente entre iterações
3. **loop-worker** implementa uma tarefa por vez
4. **loop-reviewer** verifica independentemente cada implementação
5. **scripts/loop.sh** orquestra o ciclo automaticamente

## Comandos disponíveis

- `/loop` - Executa uma iteração manual do loop
- `./scripts/loop.sh` - Executa o loop automaticamente

## Estrutura de arquivos

```
.loop/
├── GOAL.md      # Requisitos e critérios
├── STATE.md     # Estado persistente
└── RUN_LOG.md   # Log de execuções (opcional)

.opencode/
├── agents/
│   ├── loop-worker.md    # Agente implementador
│   └── loop-reviewer.md  # Agente verificador
├── commands/
│   └── loop.md           # Comando manual
└── skills/
    └── loop-engineer/
        └── SKILL.md      # Esta documentação
```

## Boas práticas

1. **Uma tarefa por vez**: O worker nunca deve implementar múltiplas features
2. **Verificação independente**: O reviewer nunca confia no worker
3. **Estado persistente**: STATE.md deve sempre refletir o estado real
4. **Proteções contra loop infinito**: Use MAX_ITERATIONS e MAX_FAILED_ATTEMPTS
5. **Git worktree**: Para isolamento seguro (avançado)

## Exemplo de uso

```bash
# Iniciar o loop
./scripts/loop.sh

# Ou executar uma iteração manualmente
opencode run --agent loop-worker "Execute uma iteração do loop"
```