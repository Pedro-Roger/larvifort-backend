#!/usr/bin/env bash

set -u

MAX_ITERATIONS="${MAX_ITERATIONS:-10}"

echo "LAVIFORT API LOOP"
echo "MAX_ITERATIONS=$MAX_ITERATIONS"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    if grep -qE '^status: (DONE|BLOCKED)$' .loop/STATE.md 2>/dev/null; then
        status="$(awk '/^status:/{print $2; exit}' .loop/STATE.md)"
        echo "STOP_REASON=$status"
        [[ "$status" == "DONE" ]] && exit 0 || exit 2
    fi
    echo "ITERATION=$i"
    opencode run --agent loop-worker "Execute exatamente uma tarefa pendente. Leia .loop/GOAL.md, .loop/ARCHITECTURE.md, .loop/TASKS.json e .loop/STATE.md. Atualize todos os arquivos de estado."
    worker_status=$?
    opencode run --agent loop-reviewer "Revise a tarefa desta iteracao. Leia .loop/GOAL.md, .loop/ARCHITECTURE.md, .loop/TASKS.json e .loop/STATE.md. Execute scripts/verify.sh e registre evidencia."
    reviewer_status=$?

    if [[ $worker_status -ne 0 || $reviewer_status -ne 0 ]]; then
        echo "STOP_REASON=AGENT_COMMAND_FAILED"
        exit 1
    fi
    if grep -q '^BLOCKED:' .loop/STATE.md 2>/dev/null; then
        echo "STOP_REASON=BLOCKED"
        exit 2
    fi
    grep -q 'VERIFICATION: FAIL' .loop/STATE.md 2>/dev/null && echo "VERIFICATION=FAIL" || echo "VERIFICATION=PASS"

done

echo ""
echo "STOP_REASON=ITERATION_LIMIT"
exit 3
