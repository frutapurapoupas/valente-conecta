# ==================================================
# SYSTEM ARCHITECT - AUDITORIA DE ARQUITETURA v2.0
# ==================================================
# Valente Conecta - AI ENGINEERING FRAMEWORK
# ==================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SYSTEM ARCHITECT - AUDITORIA DE ARQUITETURA" -ForegroundColor Cyan
Write-Host "  Versão: 2.0" -ForegroundColor Cyan
Write-Host "  Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm')" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$violacoes = @()
$arquivosAnalisados = 0

# =============================================
# 1. VERIFICAR ESTRUTURA DE PASTAS OBRIGATÓRIA
# =============================================
Write-Host "📁 [1] VERIFICANDO ESTRUTURA DE PASTAS..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

$pastasObrigatorias = @(
    "src/components",
    "src/hooks",
    "src/services",
    "src/repositories",
    "src/types",
    "src/schemas",
    "src/validators",
    "src/utils",
    "src/lib",
    "src/modules"
)

$pastasCriadas = 0
foreach ($pasta in $pastasObrigatorias) {
    $caminho = Join-Path $projectRoot $pasta
    if (-not (Test-Path $caminho)) {
        $violacoes += [PSCustomObject]@{
            Tipo = "CRÍTICO"
            Categoria = "Estrutura"
            Descricao = "Pasta obrigatória não encontrada: $pasta"
            Arquivo = $pasta
            Recomendacao = "Criar a estrutura imediatamente"
        }
        Write-Host "  ❌ $pasta - NÃO ENCONTRADA" -ForegroundColor Red
    } else {
        $pastasCriadas++
        Write-Host "  ✅ $pasta" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📊 Pastas encontradas: $pastasCriadas/$($pastasObrigatorias.Count)" -ForegroundColor White

# =============================================
# 2. ANALISAR MÓDULOS EXISTENTES
# =============================================
Write-Host ""
Write-Host "📦 [2] ANALISANDO MÓDULOS..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

if (Test-Path "src/modules") {
    $modulos = Get-ChildItem -Path "src/modules" -Directory
    Write-Host "Módulos encontrados: $($modulos.Count)" -ForegroundColor White
    
    foreach ($modulo in $modulos) {
        $estrutura = @("components", "hooks", "services", "repositories", "types", "schemas", "validators", "utils")
        $completo = $true
        foreach ($pasta in $estrutura) {
            if (-not (Test-Path "src/modules/$($modulo.Name)/$pasta")) {
                $completo = $false
            }
        }
        if ($completo) {
            Write-Host "  ✅ $($modulo.Name) - COMPLETO" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ $($modulo.Name) - INCOMPLETO" -ForegroundColor Yellow
            $violacoes += [PSCustomObject]@{
                Tipo = "ALTO"
                Categoria = "Modulo"
                Descricao = "Módulo $($modulo.Name) com estrutura incompleta"
                Arquivo = "src/modules/$($modulo.Name)"
                Recomendacao = "Adicionar pastas faltantes"
            }
        }
    }
}

# =============================================
# 3. VERIFICAR VIOLAÇÕES DE CAMADA - UI
# =============================================
Write-Host ""
Write-Host "🖥️ [3] VERIFICANDO VIOLAÇÕES DE CAMADA (UI)..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

$arquivosUI = Get-ChildItem -Path "$projectRoot/app" -Recurse -Include "*.tsx", "*.jsx" -ErrorAction SilentlyContinue
$uiViolacoes = 0

foreach ($arquivo in $arquivosUI) {
    $arquivosAnalisados++
    $conteudo = Get-Content $arquivo.FullName -ErrorAction SilentlyContinue
    if (-not $conteudo) { continue }
    $conteudoStr = $conteudo -join "`n"
    
    $caminhoRelativo = $arquivo.FullName.Replace($projectRoot, "").TrimStart('\')
    
    if ($conteudoStr -match "supabase|@supabase/supabase-js") {
        $violacoes += [PSCustomObject]@{
            Tipo = "CRÍTICO"
            Categoria = "UI"
            Descricao = "UI acessando Supabase diretamente"
            Arquivo = $caminhoRelativo
            Recomendacao = "Criar Repository e Service"
        }
        $uiViolacoes++
    }
}

Write-Host "  Arquivos UI: $($arquivosUI.Count) | Violações: $uiViolacoes" -ForegroundColor $(if ($uiViolacoes -gt 0) { "Red" } else { "Green" })

# =============================================
# 4. VERIFICAR DUPLICAÇÕES
# =============================================
Write-Host ""
Write-Host "📄 [4] VERIFICANDO ARQUIVOS DUPLICADOS..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Gray

$todosArquivos = @()
$todosArquivos += Get-ChildItem -Path "$projectRoot/src" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue
$todosArquivos += Get-ChildItem -Path "$projectRoot/app" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue
$todosArquivos = $todosArquivos | Where-Object { $_.FullName -notmatch "node_modules|\.next|\.git" }

$duplicados = $todosArquivos | Group-Object Name | Where-Object { $_.Count -gt 1 }
$totalDuplicados = 0

foreach ($grupo in $duplicados) {
    $totalDuplicados += $grupo.Count
    $caminhos = $grupo.Group | ForEach-Object { $_.FullName.Replace($projectRoot, "").TrimStart('\') }
    
    $violacoes += [PSCustomObject]@{
        Tipo = "ALTO"
        Categoria = "Duplicacao"
        Descricao = "Arquivo duplicado: $($grupo.Name) ($($grupo.Count) cópias)"
        Arquivo = ($caminhos -join " | ")
        Recomendacao = "Consolidar em src/modules/"
    }
}

Write-Host "  Arquivos analisados: $($todosArquivos.Count)" -ForegroundColor Gray
Write-Host "  Duplicações: $($duplicados.Count) grupos | $totalDuplicados ocorrências" -ForegroundColor $(if ($duplicados.Count -gt 0) { "Yellow" } else { "Green" })

# =============================================
# 5. GERAR RELATÓRIO
# =============================================
Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  RELATÓRIO DE AUDITORIA" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host ""

$criticas = $violacoes | Where-Object { $_.Tipo -eq "CRÍTICO" }
$altas = $violacoes | Where-Object { $_.Tipo -eq "ALTO" }

Write-Host "Total de violações: $($violacoes.Count)" -ForegroundColor $(if ($violacoes.Count -gt 0) { "Red" } else { "Green" })
Write-Host "  🔴 CRÍTICAS: $($criticas.Count)" -ForegroundColor Red
Write-Host "  🟠 ALTAS: $($altas.Count)" -ForegroundColor Yellow

if ($violacoes.Count -gt 0) {
    Write-Host ""
    Write-Host "🔍 LISTA DAS PRINCIPAIS VIOLAÇÕES:" -ForegroundColor White
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    $i = 1
    foreach ($v in $violacoes) {
        if ($i -gt 20) { 
            Write-Host "  ... e mais $($violacoes.Count - 20) violações" -ForegroundColor Gray
            break 
        }
        $cor = if ($v.Tipo -eq "CRÍTICO") { "Red" } else { "Yellow" }
        Write-Host "[$i] [$($v.Tipo)] $($v.Categoria) - $($v.Descricao)" -ForegroundColor $cor
        Write-Host "    📁 $($v.Arquivo)" -ForegroundColor DarkGray
        $i++
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  FIM DA AUDITORIA" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
