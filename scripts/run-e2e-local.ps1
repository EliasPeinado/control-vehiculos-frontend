# Script para ejecutar tests E2E localmente
# Uso: .\scripts\run-e2e-local.ps1

Write-Host "🎭 Iniciando tests E2E de Playwright..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js version: $(node --version)" -ForegroundColor Green

# Verificar que las dependencias están instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar que Playwright está instalado
Write-Host "🔍 Verificando instalación de Playwright..." -ForegroundColor Yellow
npx playwright --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "📥 Instalando navegadores de Playwright..." -ForegroundColor Yellow
    npx playwright install
}

Write-Host ""
Write-Host "🚀 Ejecutando tests E2E..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar tests
npm run e2e

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Tests completados exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Para ver el reporte HTML, ejecuta:" -ForegroundColor Cyan
    Write-Host "   npm run e2e:report" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Algunos tests fallaron" -ForegroundColor Red
    Write-Host ""
    Write-Host "📊 Para ver el reporte HTML, ejecuta:" -ForegroundColor Cyan
    Write-Host "   npm run e2e:report" -ForegroundColor White
    Write-Host ""
    Write-Host "🐛 Para debuggear, ejecuta:" -ForegroundColor Cyan
    Write-Host "   npm run e2e:debug" -ForegroundColor White
}

Write-Host ""
