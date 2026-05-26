# deploy.ps1 - Deploy automático para Vercel

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "🚀 DEPLOY VALENTE CONECTA PARA VERCEL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow

# Verificar se Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "1️⃣  FAZENDO BUILD LOCAL..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build! Corrija os erros antes de continuar." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green

Write-Host ""
Write-Host "2️⃣  FAZENDO DEPLOY NA VERCEL..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Serão solicitadas as seguintes informações:" -ForegroundColor Cyan
Write-Host "   • Email da Vercel (ou login)" -ForegroundColor White
Write-Host "   • Projeto: valente-conecta" -ForegroundColor White
Write-Host "   • Diretório: ./" -ForegroundColor White
Write-Host "   • Framework: Next.js" -ForegroundColor White
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ DEPLOY CONCLUÍDO!" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
