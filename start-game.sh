#!/bin/bash
# Script para iniciar Catán Cósmico

echo "🌌 Iniciando Catán Cósmico..."
echo ""
echo "El servidor estará disponible en: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

cd "$(dirname "$0")"
npm run dev
