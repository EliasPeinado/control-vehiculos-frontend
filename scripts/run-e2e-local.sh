#!/bin/bash
# Script para ejecutar tests E2E localmente
# Uso: ./scripts/run-e2e-local.sh

echo "🎭 Iniciando tests E2E de Playwright..."
echo ""

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Verificar que las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar que Playwright está instalado
echo "🔍 Verificando instalación de Playwright..."
npx playwright --version

if [ $? -ne 0 ]; then
    echo "📥 Instalando navegadores de Playwright..."
    npx playwright install
fi

echo ""
echo "🚀 Ejecutando tests E2E..."
echo ""

# Ejecutar tests
npm run e2e

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tests completados exitosamente!"
    echo ""
    echo "📊 Para ver el reporte HTML, ejecuta:"
    echo "   npm run e2e:report"
else
    echo ""
    echo "❌ Algunos tests fallaron"
    echo ""
    echo "📊 Para ver el reporte HTML, ejecuta:"
    echo "   npm run e2e:report"
    echo ""
    echo "🐛 Para debuggear, ejecuta:"
    echo "   npm run e2e:debug"
fi

echo ""
