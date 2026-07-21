# ==================================================
# SYSTEM ARCHITECT - AUDITORIA COMPLETA v3.0
# ==================================================
# Valente Conecta - Resolução de Pendências
# ==================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SYSTEM ARCHITECT - AUDITORIA COMPLETA v3.0" -ForegroundColor Cyan
Write-Host "  Data: 20/07/2026 12:59" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$violacoes = @()
$arquivosAnalisados = 0

# =============================================
# 1. VERIFICAR ESTRUTURA DE PASTAS
# =============================================
Write-Host "📁 [1] VERIFICANDO ESTRUTURA..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

$pastasObrigatorias = @(
    "src/components", "src/hooks", "src/services", "src/repositories",
    "src/types", "src/schemas", "src/validators", "src/utils", "src/lib", "src/modules"
)

$pastasCriadas = 0
foreach ($pasta in $pastasObrigatorias) {
    if (Test-Path $pasta) {
        $pastasCriadas++
        Write-Host "  ✅ $pasta" -ForegroundColor Green
    } else {
        $violacoes += [PSCustomObject]@{
            Tipo = "CRÍTICO"; Categoria = "Estrutura"
            Descricao = "Pasta obrigatória não encontrada: $pasta"
            Arquivo = $pasta; Recomendacao = "Criar a estrutura imediatamente"
        }
        Write-Host "  ❌ $pasta - NÃO ENCONTRADA" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Pastas: $pastasCriadas/$($pastasObrigatorias.Count)" -ForegroundColor White

# =============================================
# 2. VERIFICAR UI ACESSANDO SUPABASE
# =============================================
Write-Host ""
Write-Host "🔴 [2] VERIFICANDO UI ACESSANDO SUPABASE..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

$arquivosUI = Get-ChildItem -Path "$projectRoot/app" -Recurse -Include "*.tsx", "*.jsx" -ErrorAction SilentlyContinue
$uiSupabaseViolacoes = @()

foreach ($arquivo in $arquivosUI) {
    $conteudo = Get-Content $arquivo.FullName -ErrorAction SilentlyContinue
    if (-not $conteudo) { continue }
    $conteudoStr = $conteudo -join "
"
    
    if ($conteudoStr -match "supabase|@supabase/supabase-js") {
        $caminho = $arquivo.FullName.Replace($projectRoot, "").TrimStart('\')
        $uiSupabaseViolacoes += $caminho
        $violacoes += [PSCustomObject]@{
            Tipo = "CRÍTICO"; Categoria = "UI-Supabase"
            Descricao = "UI acessando Supabase diretamente"
            Arquivo = $caminho
            Recomendacao = "Criar Service + Repository"
        }
        Write-Host "  ❌ $caminho" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  Total: $($uiSupabaseViolacoes.Count) violações" -ForegroundColor $(if ($uiSupabaseViolacoes.Count -gt 0) { "Red" } else { "Green" })

# =============================================
# 3. VERIFICAR DUPLICAÇÕES REAIS
# =============================================
Write-Host ""
Write-Host "🟠 [3] VERIFICANDO DUPLICAÇÕES REAIS..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

$todosArquivos = @()
$todosArquivos += Get-ChildItem -Path "$projectRoot/src" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue
$todosArquivos += Get-ChildItem -Path "$projectRoot/app" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue
$todosArquivos += Get-ChildItem -Path "$projectRoot/components" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue
$todosArquivos += Get-ChildItem -Path "$projectRoot/hooks" -Recurse -Include "*.ts" -ErrorAction SilentlyContinue
$todosArquivos += Get-ChildItem -Path "$projectRoot/services" -Recurse -Include "*.ts" -ErrorAction SilentlyContinue
$todosArquivos += Get-ChildItem -Path "$projectRoot/types" -Recurse -Include "*.ts" -ErrorAction SilentlyContinue
$todosArquivos = $todosArquivos | Where-Object { $_.FullName -notmatch "node_modules|\.next|\.git" }

$duplicados = $todosArquivos | Group-Object Name | Where-Object { $_.Count -gt 1 }
$duplicacoesReais = @()

foreach ($grupo in $duplicados) {
    $nome = $grupo.Name
    if ($nome -in @("page.tsx", "layout.tsx", "page.ts", "layout.ts")) { continue }
    
    $caminhos = $grupo.Group | ForEach-Object { $_.FullName.Replace($projectRoot, "").TrimStart('\') }
    $duplicacoesReais += @{ Nome = $nome; Caminhos = $caminhos; Count = $grupo.Count }
    
    $violacoes += [PSCustomObject]@{
        Tipo = "ALTO"; Categoria = "Duplicacao-Real"
        Descricao = "Arquivo duplicado: $nome ($($grupo.Count) cópias)"
        Arquivo = ($caminhos -join " | ")
        Recomendacao = "Consolidar em src/modules/"
    }
    Write-Host "  ⚠️ $nome - $($grupo.Count) cópias" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Total: $($duplicacoesReais.Count) grupos" -ForegroundColor $(if ($duplicacoesReais.Count -gt 0) { "Yellow" } else { "Green" })

# =============================================
# 4. GERAR RELATÓRIO
# =============================================
Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  RELATÓRIO DE AUDITORIA" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host ""

$criticas = $violacoes | Where-Object { $_.Tipo -eq "CRÍTICO" }
$altas = $violacoes | Where-Object { $_.Tipo -eq "ALTO" }

Write-Host "Total de violações: $($violacoes.Count)" -ForegroundColor $(if ($violacoes.Count -gt 0) { "Red" } else { "Green" })
Write-Host "  🔴 CRÍTICAS (UI-Supabase): $($criticas.Count)" -ForegroundColor Red
Write-Host "  🟠 ALTAS (Duplicações): $($altas.Count)" -ForegroundColor Yellow

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  FIM DA AUDITORIA" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
