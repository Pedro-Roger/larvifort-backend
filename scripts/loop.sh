#!/usr/bin/env bash

set -u

MAX_ITERATIONS=10
MAX_FAILED_ATTEMPTS=3

echo "================================="
echo "     OPENCODE LOOP ENGINE"
echo "================================="

for ((i=1; i<=MAX_ITERATIONS; i++)); do

    echo ""
    echo "================================="
    echo " ITERATION $i / $MAX_ITERATIONS"
    echo "================================="

    # Verificar se o projeto já está concluído
    if grep -q "status: DONE" .loop/STATE.md 2>/dev/null; then
        echo ""
        echo "================================="
        echo " LOOP CONCLUÍDO"
        echo "================================="
        exit 0
    fi

    # Verificar se o loop está bloqueado
    if grep -q "status: BLOCKED" .loop/STATE.md 2>/dev/null; then
        echo ""
        echo "================================="
        echo " LOOP BLOQUEADO"
        echo " Intervenção humana necessária"
        echo "================================="
        exit 2
    fi

    # Verificar falhas consecutivas
    if grep -q "Failed Attempts:" .loop/STATE.md 2>/dev/null; then
        FAILED=$(grep "Failed Attempts:" .loop/STATE.md | sed 's/.*: //' | head -1)
        if [ "$FAILED" -ge "$MAX_FAILED_ATTEMPTS" ] 2>/dev/null; then
            echo ""
            echo "================================="
            echo " MÁXIMO DE FALHAS ATINGIDO"
            echo " Alternando para BLOCKED"
            echo "================================="
            sed -i '' 's/status: .*/status: BLOCKED/' .loop/STATE.md
            exit 2
        fi
    fi

    echo ""
    echo ">>> WORKER"
    echo ""

    opencode run \
      --agent loop-worker \
      "Execute exatamente UMA iteração do loop. Leia .loop/GOAL.md e .loop/STATE.md antes de agir."

    echo ""
    echo ">>> VERIFIER"
    echo ""

    opencode run \
      --agent loop-reviewer \
      "Verifique independentemente a implementação atual usando .loop/GOAL.md e .loop/STATE.md."

    echo ""
    echo ">>> STATE"
    cat .loop/STATE.md

    # Verificar se a iteração atual passou
    if grep -q "VERIFICATION: PASS" .loop/STATE.md 2>/dev/null; then
        echo ""
        echo "✓ Iteração $i aprovada"
    else
        echo ""
        echo "✗ Iteração $i com problemas - será retomada na próxima"
    fi

done

echo ""
echo "================================="
echo " BUDGET DO LOOP ESPOTADO"
echo "================================="
exit 1