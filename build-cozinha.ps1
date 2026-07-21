# build-cozinha.ps1

Write-Host "`n=== BUILD DO MÓDULO COZINHA ===" -ForegroundColor Green

# 1. Verificar se o tsconfig.build.json existe
if (-not (Test-Path "tsconfig.build.json")) {
    Write-Host "❌ tsconfig.build.json não encontrado!" -ForegroundColor Red
    exit 1
}

# 2. Configurar ambiente
$env:NODE_OPTIONS="--max-old-space-size=4096"
$env:NEXT_DISABLE_TYPESCRIPT_CHECK=1

# 3. Build com tsconfig personalizado
Write-Host "📦 Buildando módulo Cozinha..."
npm run build -- --tsconfig tsconfig.build.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Acesse: http://localhost:3000/cozinha" -ForegroundColor Yellow
} else {
    Write-Host "❌ Build falhou!" -ForegroundColor Red
}