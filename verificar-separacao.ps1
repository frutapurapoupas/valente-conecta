# verificar-separacao.ps1

Write-Host "=== VERIFICANDO SEPARAÇÃO DESIGN/LÓGICA ===" -ForegroundColor Yellow

$base = "c:\valente_conecta\app\cozinha"

# 1. Verificar arquivos UI (não devem ter lógica)
Write-Host "`n🔍 Verificando arquivos UI (DESIGN PURO):" -ForegroundColor Cyan
Get-ChildItem "$base\components\*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'useState|useEffect|fetch|axios|useRouter') {
        Write-Host "   ⚠️  $($_.Name) contém LÓGICA!" -ForegroundColor Red
    } else {
        Write-Host "   ✅ $($_.Name) OK (só design)" -ForegroundColor Green
    }
}

# 2. Verificar arquivos Container (não devem ter HTML)
Write-Host "`n🔍 Verificando arquivos Container (LÓGICA PURA):" -ForegroundColor Cyan
Get-ChildItem "$base\containers\*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match '<div|<span|<button|<a|<h1|<p|<img') {
        Write-Host "   ⚠️  $($_.Name) contém DESIGN!" -ForegroundColor Red
    } else {
        Write-Host "   ✅ $($_.Name) OK (só lógica)" -ForegroundColor Green
    }
}

# 3. Verificar hooks (não devem ter JSX)
Write-Host "`n🔍 Verificando Hooks (LÓGICA DE NEGÓCIO):" -ForegroundColor Cyan
Get-ChildItem "$base\hooks\*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'return\s*\(|jsx|JSX') {
        Write-Host "   ⚠️  $($_.Name) contém JSX!" -ForegroundColor Red
    } else {
        Write-Host "   ✅ $($_.Name) OK (só lógica)" -ForegroundColor Green
    }
}

Write-Host "`n✅ VERIFICAÇÃO CONCLUÍDA!" -ForegroundColor Green
