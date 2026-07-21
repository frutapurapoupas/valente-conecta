#!/usr/bin/env pwsh
# ============================================================
# AUDITOR_UI_LOGICA_COZINHA.ps1 - VERSÃO SIMPLIFICADA
# Auditoria de Arquitetura - Módulo Cozinha
# ============================================================

param(
    [switch]$Silent,
    [switch]$Help
)

if ($Help) {
    Write-Host ""
    Write-Host "🔍 AUDITOR_UI_LOGICA_COZINHA.ps1"
    Write-Host ""
    Write-Host "Uso: .\AUDITOR_UI_LOGICA_COZINHA.ps1 [-Silent] [-Help]"
    Write-Host ""
    exit 0
}

# ============================================================
# CONFIGURAÇÕES
# ============================================================
$projectRoot = "C:\valente_conecta"
$outputDir = "C:\valente_conecta\auditoria_ui_logica"
New-Item -Path $outputDir -ItemType Directory -Force | Out-Null

# ============================================================
# CORES
# ============================================================
$Cyan = "Cyan"
$Yellow = "Yellow"
$Green = "Green"
$Red = "Red"
$White = "White"
$Gray = "Gray"

function Write-Color {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# ============================================================
# BANNER
# ============================================================
function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Color "╔══════════════════════════════════════════════════════════════════╗" $Cyan
    Write-Color "║                                                                  ║" $Cyan
    Write-Color "║   🧠  AUDITOR UI x LÓGICA - MÓDULO COZINHA                      ║" $Yellow
    Write-Color "║                                                                  ║" $Cyan
    Write-Color "║   Análise de Arquitetura e Separação de Responsabilidades        ║" $Cyan
    Write-Color "║                                                                  ║" $Cyan
    Write-Color "╚══════════════════════════════════════════════════════════════════╝" $Cyan
    Write-Host ""
    Write-Color "  📂 Projeto: $projectRoot" $Gray
    Write-Color "  📁 Saída:   $outputDir" $Gray
    Write-Host ""
}

# ============================================================
# FUNÇÃO PARA CONTAR OCORRÊNCIAS
# ============================================================
function Count-Occurrences {
    param([string]$Content, [string]$Pattern)
    if ([string]::IsNullOrEmpty($Content)) { return 0 }
    try {
        return ([regex]::Matches($Content, $Pattern)).Count
    } catch {
        return 0
    }
}

# ============================================================
# FUNÇÃO DE ANÁLISE DE ARQUIVO
# ============================================================
function Analyze-File {
    param(
        [string]$FilePath,
        [string]$Type
    )
    
    if (-not (Test-Path $FilePath)) { return $null }
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if (-not $content) { return $null }
        
        $lines = ($content -split "`n").Count
        
        $result = [PSCustomObject]@{
            Path = $FilePath
            Type = $Type
            Lines = $lines
            Imports = @()
            UseStates = 0
            UseEffects = 0
            UseMemo = 0
            UseCallback = 0
            FetchCount = 0
            SupabaseCount = 0
            JSXCount = 0
            BusinessLogicCount = 0
            Violations = @()
            HasHTML = $false
            Score = 10
            Status = "OK"
        }
        
        # Análise de imports
        $importMatches = [regex]::Matches($content, "import\s+.*?\s+from\s+['""]([^'""]+)['""]")
        foreach ($imp in $importMatches) {
            $result.Imports += $imp.Groups[1].Value
        }
        
        # Contagem de hooks React
        $result.UseStates = Count-Occurrences -Content $content -Pattern "useState\s*\("
        $result.UseEffects = Count-Occurrences -Content $content -Pattern "useEffect\s*\("
        $result.UseMemo = Count-Occurrences -Content $content -Pattern "useMemo\s*\("
        $result.UseCallback = Count-Occurrences -Content $content -Pattern "useCallback\s*\("
        
        # Contagem de fetch/axios
        $result.FetchCount = Count-Occurrences -Content $content -Pattern "fetch\s*\("
        $result.FetchCount += Count-Occurrences -Content $content -Pattern "axios\s*\."
        
        # Contagem de Supabase
        $result.SupabaseCount = Count-Occurrences -Content $content -Pattern "supabase\s*\."
        $result.SupabaseCount += Count-Occurrences -Content $content -Pattern "createClient\s*\("
        
        # Contagem de JSX
        $result.JSXCount = Count-Occurrences -Content $content -Pattern "<\s*[A-Z]"
        $result.JSXCount += Count-Occurrences -Content $content -Pattern "<\s*div"
        $result.JSXCount += Count-Occurrences -Content $content -Pattern "<\s*span"
        $result.JSXCount += Count-Occurrences -Content $content -Pattern "<\s*section"
        $result.JSXCount += Count-Occurrences -Content $content -Pattern "<\s*header"
        $result.JSXCount += Count-Occurrences -Content $content -Pattern "<\s*footer"
        
        # Contagem de lógica de negócio
        $result.BusinessLogicCount = Count-Occurrences -Content $content -Pattern "(if|for|while|switch|try|catch)\s*\("
        
        # Detecção de HTML no hook
        if ($Type -eq "Hook") {
            if ($content -match "<\s*(div|section|header|footer|span|p|h1|h2|h3|button)") {
                $result.HasHTML = $true
                $result.Violations += "HOOK_CONTA_HTML: Hook contém HTML"
            }
        }
        
        # Detecção de fetch em página
        if ($Type -eq "Page") {
            if ($result.FetchCount -gt 0 -or $result.SupabaseCount -gt 0) {
                $result.Violations += "PAGE_ACCESS_DB: Página acessa banco de dados diretamente"
                $result.Score -= 3
            }
        }
        
        # Detecção de fetch em componente
        if ($Type -eq "Component") {
            if ($result.FetchCount -gt 0 -or $result.SupabaseCount -gt 0) {
                $result.Violations += "COMPONENT_ACCESS_DB: Componente acessa banco de dados"
                $result.Score -= 3
            }
            if ($content -match "localStorage" -or $content -match "sessionStorage") {
                $result.Violations += "COMPONENT_STORAGE: Componente usa localStorage"
                $result.Score -= 2
            }
        }
        
        # Cálculo da nota
        if ($Type -eq "Page") {
            if ($result.BusinessLogicCount -gt 10) { $result.Score -= 2 }
            if ($result.FetchCount -gt 0) { $result.Score -= 2 }
            if ($result.SupabaseCount -gt 0) { $result.Score -= 3 }
            if ($result.JSXCount -lt 5) { $result.Score -= 1 }
            if ($result.Lines -gt 500) { $result.Score -= 2 }
            if ($result.Lines -gt 800) { $result.Score -= 3 }
            if ($result.Lines -gt 1000) { $result.Score -= 4 }
        }
        
        if ($Type -eq "Hook") {
            if ($result.HasHTML) { $result.Score -= 5 }
            if ($result.JSXCount -gt 0) { $result.Score -= 3 }
            if ($result.Lines -gt 300) { $result.Score -= 2 }
        }
        
        if ($Type -eq "Component") {
            if ($result.Lines -gt 250) { $result.Score -= 2 }
            if ($result.Lines -gt 400) { $result.Score -= 3 }
        }
        
        # Garante nota entre 0 e 10
        if ($result.Score -lt 0) { $result.Score = 0 }
        if ($result.Score -gt 10) { $result.Score = 10 }
        
        # Status
        if ($result.Violations.Count -gt 0) { $result.Status = "VIOLAÇÃO" }
        if ($result.Score -lt 5) { $result.Status = "CRÍTICO" }
        
        return $result
    } catch {
        return $null
    }
}

# ============================================================
# FUNÇÃO DE ANÁLISE DE API
# ============================================================
function Analyze-API {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) { return $null }
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if (-not $content) { return $null }
        
        $result = [PSCustomObject]@{
            Path = $FilePath
            HasValidation = $false
            HasErrorHandling = $false
            HasTryCatch = $false
            HasNextResponse = $false
            HasStatusCodes = $false
            Score = 10
        }
        
        if ($content -match "validation|validate|isValid|schema") { $result.HasValidation = $true }
        if ($content -match "error|Error") { $result.HasErrorHandling = $true }
        if ($content -match "try\s*\{") { $result.HasTryCatch = $true }
        if ($content -match "NextResponse") { $result.HasNextResponse = $true }
        if ($content -match "status\s*[:=]\s*\d{3}") { $result.HasStatusCodes = $true }
        
        if (-not $result.HasTryCatch) { $result.Score -= 3 }
        if (-not $result.HasErrorHandling) { $result.Score -= 2 }
        if (-not $result.HasNextResponse) { $result.Score -= 2 }
        if (-not $result.HasStatusCodes) { $result.Score -= 2 }
        
        if ($result.Score -lt 0) { $result.Score = 0 }
        return $result
    } catch {
        return $null
    }
}

# ============================================================
# FUNÇÃO PRINCIPAL DE AUDITORIA
# ============================================================
function Invoke-Audit {
    Write-Color "  🔍 Iniciando auditoria..." $Yellow
    Write-Host ""
    
    $pages = @()
    $components = @()
    $hooks = @()
    $services = @()
    $apis = @()
    $violations = @()
    $allFiles = @()
    
    # 1. ANALISAR PÁGINAS
    Write-Color "  📄 Analisando Páginas..." $Cyan
    $pageFiles = @()
    $pageFiles += Get-ChildItem -Path "$projectRoot\app\admin-master\cozinha-chef\**\page.tsx" -ErrorAction SilentlyContinue
    $pageFiles += Get-ChildItem -Path "$projectRoot\app\cozinha\**\page.tsx" -ErrorAction SilentlyContinue
    
    foreach ($file in $pageFiles) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Page"
        if ($analysis) {
            $pages += $analysis
            $allFiles += $analysis
            foreach ($v in $analysis.Violations) {
                $violations += $v
            }
        }
    }
    Write-Color "     ✓ $($pages.Count) páginas analisadas" $Gray
    
    # 2. ANALISAR COMPONENTES
    Write-Color "  🧩 Analisando Componentes..." $Cyan
    $componentFiles = Get-ChildItem -Path "$projectRoot\components\cozinha\**\*.tsx" -ErrorAction SilentlyContinue
    $componentFiles += Get-ChildItem -Path "$projectRoot\components\cozinha\**\*.jsx" -ErrorAction SilentlyContinue
    
    foreach ($file in $componentFiles) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Component"
        if ($analysis) {
            $components += $analysis
            $allFiles += $analysis
            foreach ($v in $analysis.Violations) {
                $violations += $v
            }
        }
    }
    Write-Color "     ✓ $($components.Count) componentes analisados" $Gray
    
    # 3. ANALISAR HOOKS
    Write-Color "  🪝 Analisando Hooks..." $Cyan
    $hookFiles = @()
    $hookFiles += Get-ChildItem -Path "$projectRoot\hooks\cozinha\**\*.ts" -ErrorAction SilentlyContinue
    $hookFiles += Get-ChildItem -Path "$projectRoot\hooks\cozinha\**\*.tsx" -ErrorAction SilentlyContinue
    
    foreach ($file in $hookFiles) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Hook"
        if ($analysis) {
            $hooks += $analysis
            $allFiles += $analysis
            foreach ($v in $analysis.Violations) {
                $violations += $v
            }
        }
    }
    Write-Color "     ✓ $($hooks.Count) hooks analisados" $Gray
    
    # 4. ANALISAR SERVICES
    Write-Color "  🔧 Analisando Services..." $Cyan
    $serviceFiles = @()
    $serviceFiles += Get-ChildItem -Path "$projectRoot\services\**\*.ts" -ErrorAction SilentlyContinue
    $serviceFiles += Get-ChildItem -Path "$projectRoot\lib\cozinha\**\*.ts" -ErrorAction SilentlyContinue
    
    foreach ($file in $serviceFiles) {
        if ($file.Name -match "\.test\.") { continue }
        $analysis = Analyze-File -FilePath $file.FullName -Type "Service"
        if ($analysis) {
            $services += $analysis
            $allFiles += $analysis
        }
    }
    Write-Color "     ✓ $($services.Count) services analisados" $Gray
    
    # 5. ANALISAR APIS
    Write-Color "  🌐 Analisando APIs..." $Cyan
    $apiFiles = @()
    $apiFiles += Get-ChildItem -Path "$projectRoot\app\api\cozinha\**\route.ts" -ErrorAction SilentlyContinue
    $apiFiles += Get-ChildItem -Path "$projectRoot\app\api\cozinha\**\route.js" -ErrorAction SilentlyContinue
    
    foreach ($file in $apiFiles) {
        $analysis = Analyze-API -FilePath $file.FullName
        if ($analysis) {
            $apis += $analysis
            $allFiles += $analysis
        }
    }
    Write-Color "     ✓ $($apis.Count) APIs analisadas" $Gray
    
    # 6. CALCULAR MÉTRICAS
    $totalFiles = $allFiles.Count
    $totalViolations = $violations.Count
    
    $totalScore = 0
    $countWithScore = 0
    foreach ($file in $allFiles) {
        if ($file.Score) {
            $totalScore += $file.Score
            $countWithScore++
        }
    }
    $avgScore = if ($countWithScore -gt 0) { [math]::Round($totalScore / $countWithScore, 1) } else { 0 }
    
    return [PSCustomObject]@{
        Pages = $pages
        Components = $components
        Hooks = $hooks
        Services = $services
        APIs = $apis
        AllFiles = $allFiles
        Violations = $violations
        TotalFiles = $totalFiles
        TotalPages = $pages.Count
        TotalComponents = $components.Count
        TotalHooks = $hooks.Count
        TotalServices = $services.Count
        TotalAPIs = $apis.Count
        TotalViolations = $totalViolations
        AvgScore = $avgScore
    }
}

# ============================================================
# GERADOR DE RELATÓRIOS
# ============================================================
function Generate-Report {
    param($Results)
    
    Write-Color "  📝 Gerando relatórios..." $Yellow
    Write-Host ""
    
    # 1. RELATÓRIO PRINCIPAL
    $reportPath = Join-Path $outputDir "RELATORIO_UI_LOGICA.md"
    
    $report = @"
# 📊 RELATÓRIO DE AUDITORIA UI x LÓGICA
# Módulo Cozinha - Valente Conecta
# Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")

---

## 📋 RESUMO GERAL

| Métrica | Valor |
|---------|-------|
| **Total de arquivos analisados** | $($Results.TotalFiles) |
| **Páginas** | $($Results.TotalPages) |
| **Componentes** | $($Results.TotalComponents) |
| **Hooks** | $($Results.TotalHooks) |
| **Services** | $($Results.TotalServices) |
| **APIs** | $($Results.TotalAPIs) |
| **Violações encontradas** | $($Results.TotalViolations) |
| **Nota Geral** | $($Results.AvgScore)/10 |

---

## 🚨 ARQUIVOS COM VIOLAÇÕES

"@

    $violationFiles = $Results.AllFiles | Where-Object { $_.Violations.Count -gt 0 }
    if ($violationFiles.Count -eq 0) {
        $report += "`n✅ Nenhuma violação encontrada!`n"
    } else {
        foreach ($file in $violationFiles) {
            $report += "`n### 📄 $($file.Path -replace '.*\\', '')`n"
            $report += "- **Tipo:** $($file.Type)`n"
            $report += "- **Linhas:** $($file.Lines)`n"
            $report += "- **Nota:** $($file.Score)/10`n"
            $report += "**Violações:**`n"
            foreach ($v in $file.Violations) {
                $report += "  - ⚠️ $v`n"
            }
        }
    }

    $report += @"

---

## 📋 ARQUIVOS PARA REFATORAR

### 🔴 PRIORIDADE ALTA

"@

    $highPriority = @()
    foreach ($file in $Results.AllFiles | Where-Object { $_.Violations.Count -gt 0 }) {
        $highPriority += "- 📄 $($file.Path -replace '.*\\', '') - $($file.Violations -join '; ')"
    }

    if ($highPriority.Count -eq 0) {
        $report += "`n✅ Nenhum arquivo com prioridade alta.`n"
    } else {
        foreach ($item in $highPriority) {
            $report += "`n$item"
        }
    }

    $report += @"

### 🟡 PRIORIDADE MÉDIA

"@

    $mediumPriority = @()
    foreach ($file in $Results.AllFiles | Where-Object { $_.Lines -gt 300 -and $_.Lines -le 500 }) {
        $mediumPriority += "- 📄 $($file.Path -replace '.*\\', '') - $($file.Lines) linhas"
    }

    if ($mediumPriority.Count -eq 0) {
        $report += "`n✅ Nenhum arquivo com prioridade média.`n"
    } else {
        foreach ($item in $mediumPriority) {
            $report += "`n$item"
        }
    }

    $report += @"

### 🟢 PRIORIDADE BAIXA

"@

    $lowPriority = @()
    foreach ($file in $Results.AllFiles | Where-Object { $_.UseStates -gt 5 }) {
        $lowPriority += "- 📄 $($file.Path -replace '.*\\', '') - $($file.UseStates) useState"
    }

    if ($lowPriority.Count -eq 0) {
        $report += "`n✅ Nenhum arquivo com prioridade baixa.`n"
    } else {
        foreach ($item in $lowPriority) {
            $report += "`n$item"
        }
    }

    $report += @"

---

## ✅ RESUMO FINAL

- **Arquivos analisados:** $($Results.TotalFiles)
- **Violações encontradas:** $($Results.TotalViolations)
- **Nota geral:** $($Results.AvgScore)/10
- **Status:** $(if ($Results.AvgScore -ge 7) { "✅ Arquitetura saudável" } elseif ($Results.AvgScore -ge 5) { "⚠️ Arquitetura com pontos a melhorar" } else { "🔴 Arquitetura crítica - refatoração necessária" })

---
*Relatório gerado automaticamente pelo AUDITOR_UI_LOGICA_COZINHA.ps1*
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Color "  ✅ RELATORIO_UI_LOGICA.md gerado" $Green

    # 2. CSV DE PONTUAÇÃO
    $csvPath = Join-Path $outputDir "PONTUACAO.csv"
    
    $csv = '"Arquivo","Tipo","Linhas","Complexidade","Nota","Status"'
    foreach ($file in $Results.AllFiles) {
        $name = $file.Path -replace '.*\\', ''
        $type = $file.Type
        $lines = $file.Lines
        $complexidade = if ($file.BusinessLogicCount) { $file.BusinessLogicCount } else { 0 }
        $score = if ($file.Score) { $file.Score } else { "-" }
        $status = if ($file.Status) { $file.Status } else { "OK" }
        $csv += "`n`"$name`",`"$type`",$lines,$complexidade,$score,`"$status`""
    }
    $csv | Out-File -FilePath $csvPath -Encoding UTF8
    Write-Color "  ✅ PONTUACAO.csv gerado" $Green

    # 3. ÁRVORE
    $treePath = Join-Path $outputDir "ARVORE_COZINHA.txt"
    $tree = @"
ÁRVORE DO MÓDULO COZINHA
Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")
================================================================================

app/
├── admin-master/
│   └── cozinha-chef/
│       ├── page.tsx
│       ├── compras/page.tsx
│       ├── estoque/page.tsx
│       ├── financeiro/page.tsx
│       ├── pedidos/page.tsx
│       ├── pratos/page.tsx
│       ├── producao/page.tsx
│       ├── receitas/
│       │   ├── page.tsx
│       │   └── editar/[id]/page.tsx
│       └── preview/page.tsx
├── api/
│   └── cozinha/
│       ├── cardapio/route.ts
│       ├── compras/route.ts
│       ├── estoque/route.ts
│       ├── financeiro/route.ts
│       ├── pedidos/route.ts
│       ├── pratos/route.ts
│       ├── producao/route.ts
│       └── receitas/route.ts
├── cozinha/
│   ├── catalogo/page.tsx
│   └── page.tsx

components/cozinha/
├── CatalogoUI.tsx
├── DashboardUI.tsx
├── PratoList.tsx
├── ReceitaForm.tsx
└── SelecaoPerfilUI.tsx

hooks/cozinha/
├── useCardapio.ts
├── useCompras.ts
├── useDashboard.ts
├── useEstoque.ts
├── usePratos.ts
├── useProducao.ts
└── useReceitas.ts

services/
└── cozinhaService.ts

lib/cozinha/
└── types.ts
"@
    $tree | Out-File -FilePath $treePath -Encoding UTF8
    Write-Color "  ✅ ARVORE_COZINHA.txt gerado" $Green

    Write-Host ""
    Write-Color "  ✅ Relatórios gerados em: $outputDir" $Green
}

# ============================================================
# PROGRAMA PRINCIPAL
# ============================================================

Show-Banner

if (-not (Test-Path $projectRoot)) {
    Write-Color "  ❌ Projeto não encontrado em: $projectRoot" $Red
    exit 1
}

$startTime = Get-Date
$results = Invoke-Audit
$endTime = Get-Date

Generate-Report -Results $results

# ============================================================
# RESUMO FINAL
# ============================================================
Write-Host ""
Write-Color "╔══════════════════════════════════════════════════════════════════╗" $Cyan
Write-Color "║   ✅ AUDITORIA CONCLUÍDA                                        ║" $Green
Write-Color "║                                                                  ║" $Cyan
Write-Color "║   Arquivos analisados: $($results.TotalFiles)                              ║" $White
Write-Color "║   Páginas:          $($results.TotalPages)                                   ║" $White
Write-Color "║   Componentes:      $($results.TotalComponents)                               ║" $White
Write-Color "║   Hooks:            $($results.TotalHooks)                                   ║" $White
Write-Color "║   Services:         $($results.TotalServices)                                 ║" $White
Write-Color "║   APIs:             $($results.TotalAPIs)                                     ║" $White
Write-Color "║   Violações:        $($results.TotalViolations)                               ║" $(if ($results.TotalViolations -gt 0) { $Red } else { $Green })
Write-Color "║   Nota Geral:       $($results.AvgScore)/10                                  ║" $Yellow
Write-Color "║                                                                  ║" $Cyan
Write-Color "║   📁 Relatórios em: $outputDir ║" $Gray
Write-Color "║                                                                  ║" $Cyan
Write-Color "║   ⏱️  Tempo: $([math]::Round(($endTime - $startTime).TotalSeconds, 1))s                                   ║" $Gray
Write-Color "╚══════════════════════════════════════════════════════════════════╝" $Cyan
Write-Host ""
Write-Color "  📄 Relatórios gerados:" $Yellow
Write-Color "     - RELATORIO_UI_LOGICA.md" $White
Write-Color "     - ARVORE_COZINHA.txt" $White
Write-Color "     - PONTUACAO.csv" $White
Write-Host ""