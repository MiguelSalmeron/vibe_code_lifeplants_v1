#!/bin/bash

# Script de servidor simple para LifePlants
# Detecta el entorno y ejecuta el servidor apropiado

PORT=${1:-8000}

echo "╔════════════════════════════════════════════════╗"
echo "║          🌱 LifePlants Dev Server 🌱          ║"
echo "╠════════════════════════════════════════════════╣"
echo "║                                                ║"
echo "║  Iniciando servidor en puerto $PORT...          ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Verificar si Python está disponible
if command -v python3 &> /dev/null; then
    echo "✓ Usando Python 3"
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✓ Usando Python"
    python -m SimpleHTTPServer $PORT
elif command -v node &> /dev/null; then
    echo "✓ Usando Node.js"
    if command -v npx &> /dev/null; then
        npx http-server -p $PORT
    else
        echo "⚠ npx no está disponible. Instalando http-server..."
        npm install -g http-server
        http-server -p $PORT
    fi
elif command -v php &> /dev/null; then
    echo "✓ Usando PHP"
    php -S localhost:$PORT
else
    echo "✗ No se encontró Python, Node.js ni PHP"
    echo "  Por favor instala uno de estos para ejecutar el servidor"
    exit 1
fi
