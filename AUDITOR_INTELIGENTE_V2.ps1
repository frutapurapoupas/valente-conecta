#!/usr/bin/env pwsh
# ============================================================
# AUDITOR_INTELIGENTE_V2.ps1 - SEM EMOJIS
# Auditoria Completa do Modulo Cozinha
# Versao: 2.0.1
# ============================================================

param(
    [switch]$Help
)

if ($Help) {
    Write-Host ""
    Write-Host "AUDITOR_INTELIGENTE_V2.ps1"
    Write-Host ""
    Write-Host "Uso: .\AUDITOR_INTELIGENTE_V2.ps1"
    Write-Host ""
    exit 0
}

# ============================================================
# CONFIGURACOES
# ============================================================
$projectRoot = "C:\valente_conecta"
$outputDir = "C:\valente_conecta\auditoria_completa"
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
    Write-Color "=====================================================================" $Cyan
    Write-Color "  AUDITOR INTELIGENTE V2 - MODULO COZINHA                            " $Yellow
    Write-Color "  Analise Completa de Arquitetura                                    " $Cyan
    Write-Color "=====================================================================" $Cyan
    Write-Host ""
    Write-Color "  Projeto: $projectRoot" $Gray
    Write-Color "  Saida:   $outputDir" $Gray
    Write-Host ""
}

# ============================================================
# FUNCOES DE BUSCA
# ============================================================

function Find-All-Files {
    param(
        [string]$BasePath,
        [string[]]$Patterns,
        [string[]]$ExcludeFolders = @("node_modules", ".next", "dist", "build")
    )
    
    $results = @()
    
    foreach ($pattern in $Patterns) {
        $files = Get-ChildItem -Path $BasePath -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $shouldExclude = $false
            foreach ($folder in $ExcludeFolders) {
                if ($file.FullName -match $folder) {
                    $shouldExclude = $true
                    break
                }
            }
            if (-not $shouldExclude) {
                $results += $file
            }
        }
    }
    
    return $results | Sort-Object -Property FullName -Unique
}

# ============================================================
# ANALISE DE ARQUIVO
# ============================================================
function Analyze-File-Intelligent {
    param(
        [string]$FilePath,
        [string]$Type
    )
    
    if (-not (Test-Path $FilePath)) { return $null }
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if (-not $content) { return $null }
        
        $lines = ($content -split "`n").Count
        $relativePath = $FilePath.Replace($projectRoot, "").TrimStart('\')
        
        # Analise detalhada
        $hasFetch = ($content -match "fetch\s*\(")
        $hasSupabase = ($content -match "supabase\s*\.") -or ($content -match "createClient\s*\(")
        $hasLocalStorage = ($content -match "localStorage") -or ($content -match "sessionStorage")
        $hasJSX = ($content -match "<\s*[A-Z]") -or ($content -match "<\s*div") -or ($content -match "<\s*span")
        $hasReturnJSX = ($content -match "return\s*\(") -and $hasJSX
        $hasUseState = ($content -match "useState\s*\(")
        $hasUseEffect = ($content -match "useEffect\s*\(")
        $hasUseMemo = ($content -match "useMemo\s*\(")
        $hasUseCallback = ($content -match "useCallback\s*\(")
        $hasTryCatch = ($content -match "try\s*\{")
        $hasErrorHandling = ($content -match "catch|error|Error")
        
        # Deteccao de violacoes
        $violations = @()
        $score = 10
        
        if ($Type -eq "Page") {
            if ($hasFetch -or $hasSupabase) {
                $violations += "PAGE_ACCESS_DB: Pagina acessa banco de dados diretamente"
                $score -= 4
            }
            if ($lines -gt 500) {
                $violations += "PAGE_TOO_LARGE: $lines linhas (recomendado <300)"
                $score -= 2
            }
            if ($lines -gt 800) {
                $violations += "PAGE_CRITICAL: $lines linhas (refatoracao urgente!)"
                $score -= 2
            }
            if (-not $hasReturnJSX) {
                $violations += "PAGE_NO_UI: Pagina nao renderiza componentes"
                $score -= 2
            }
        }
        
        if ($Type -eq "Component") {
            if ($hasFetch -or $hasSupabase) {
                $violations += "COMPONENT_ACCESS_DB: Componente acessa banco de dados"
                $score -= 4
            }
            if ($hasLocalStorage) {
                $violations += "COMPONENT_STORAGE: Componente usa localStorage"
                $score -= 2
            }
            if ($lines -gt 250) {
                $violations += "COMPONENT_TOO_LARGE: $lines linhas (recomendado <200)"
                $score -= 2
            }
        }
        
        if ($Type -eq "Hook") {
            if ($hasJSX -and $hasReturnJSX) {
                $violations += "HOOK_CONTA_HTML: Hook renderiza HTML (deve ser componente)"
                $score -= 5
            }
            if ($lines -gt 300) {
                $violations += "HOOK_TOO_LARGE: $lines linhas (recomendado <200)"
                $score -= 2
            }
        }
        
        if ($Type -eq "API") {
            if (-not $hasTryCatch) {
                $violations += "API_NO_ERROR_HANDLING: Sem try/catch"
                $score -= 3
            }
            if (-not $hasErrorHandling) {
                $violations += "API_NO_ERROR_RESPONSE: Sem tratamento de erro"
                $score -= 2
            }
        }
        
        # Garante nota entre 0 e 10
        if ($score -lt 0) { $score = 0 }
        
        $status = if ($violations.Count -gt 0) { "VIOLACAO" } else { "OK" }
        if ($score -lt 5) { $status = "CRITICO" }
        
        return [PSCustomObject]@{
            Path = $relativePath
            FullPath = $FilePath
            Type = $Type
            Lines = $lines
            HasFetch = $hasFetch
            HasSupabase = $hasSupabase
            HasLocalStorage = $hasLocalStorage
            HasJSX = $hasJSX
            HasReturnJSX = $hasReturnJSX
            HasUseState = $hasUseState
            HasUseEffect = $hasUseEffect
            HasUseMemo = $hasUseMemo
            HasUseCallback = $hasUseCallback
            HasTryCatch = $hasTryCatch
            HasErrorHandling = $hasErrorHandling
            Violations = $violations
            Score = $score
            Status = $status
        }
    } catch {
        return $null
    }
}

# ============================================================
# AUDITORIA PRINCIPAL
# ============================================================
function Invoke-IntelligentAudit {
    Write-Color "  Iniciando auditoria inteligente..." $Yellow
    Write-Host ""
    
    $pages = @()
    $components = @()
    $hooks = @()
    $services = @()
    $apis = @()
    $types = @()
    $totalFiles = 0
    $totalViolations = 0
    
    # 1. PAGINAS
    Write-Color "  Buscando Paginas..." $Cyan
    $pageFiles = Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef" -Patterns "*.page.tsx", "page.tsx"
    $pageFiles += Find-All-Files -BasePath "$projectRoot\app\cozinha" -Patterns "*.page.tsx", "page.tsx"
    
    foreach ($file in $pageFiles) {
        $analysis = Analyze-File-Intelligent -FilePath $file.FullName -Type "Page"
        if ($analysis) {
            $pages += $analysis
            $totalFiles++
            if ($analysis.Violations.Count -gt 0) {
                $totalViolations += $analysis.Violations.Count
            }
        }
    }
    Write-Color "     OK $($pages.Count) paginas encontradas" $Gray
    
    # 2. COMPONENTES
    Write-Color "  Buscando Componentes..." $Cyan
    $componentFiles = Find-All-Files -BasePath "$projectRoot\components\cozinha" -Patterns "*.tsx", "*.jsx"
    $componentFiles += Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\components" -Patterns "*.tsx", "*.jsx"
    
    foreach ($file in $componentFiles) {
        $analysis = Analyze-File-Intelligent -FilePath $file.FullName -Type "Component"
        if ($analysis) {
            $components += $analysis
            $totalFiles++
            if ($analysis.Violations.Count -gt 0) {
                $totalViolations += $analysis.Violations.Count
            }
        }
    }
    Write-Color "     OK $($components.Count) componentes encontrados" $Gray
    
    # 3. HOOKS
    Write-Color "  Buscando Hooks..." $Cyan
    $hookFiles = Find-All-Files -BasePath "$projectRoot\hooks\cozinha" -Patterns "*.ts", "*.tsx"
    $hookFiles += Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\hooks" -Patterns "*.ts", "*.tsx"
    
    foreach ($file in $hookFiles) {
        $analysis = Analyze-File-Intelligent -FilePath $file.FullName -Type "Hook"
        if ($analysis) {
            $hooks += $analysis
            $totalFiles++
            if ($analysis.Violations.Count -gt 0) {
                $totalViolations += $analysis.Violations.Count
            }
        }
    }
    Write-Color "     OK $($hooks.Count) hooks encontrados" $Gray
    
    # 4. SERVICES
    Write-Color "  Buscando Services..." $Cyan
    $serviceFiles = Find-All-Files -BasePath "$projectRoot\services" -Patterns "*.service.ts", "*.service.js", "*Service.ts", "*Service.js"
    $serviceFiles += Find-All-Files -BasePath "$projectRoot\lib\cozinha" -Patterns "*.ts"
    
    foreach ($file in $serviceFiles) {
        $analysis = Analyze-File-Intelligent -FilePath $file.FullName -Type "Service"
        if ($analysis) {
            $services += $analysis
            $totalFiles++
        }
    }
    Write-Color "     OK $($services.Count) services encontrados" $Gray
    
    # 5. APIS
    Write-Color "  Buscando APIs..." $Cyan
    $apiFiles = Find-All-Files -BasePath "$projectRoot\app\api\cozinha" -Patterns "route.ts", "route.js"
    
    foreach ($file in $apiFiles) {
        $analysis = Analyze-File-Intelligent -FilePath $file.FullName -Type "API"
        if ($analysis) {
            $apis += $analysis
            $totalFiles++
        }
    }
    Write-Color "     OK $($apis.Count) APIs encontradas" $Gray
    
    # 6. TYPES
    Write-Color "  Buscando Types..." $Cyan
    $typeFiles = Find-All-Files -BasePath "$projectRoot\types\cozinha" -Patterns "*.ts"
    $typeFiles += Find-All-Files -BasePath "$projectRoot\lib\cozinha" -Patterns "*.ts"
    
    foreach ($file in $typeFiles) {
        $analysis = Analyze-File-Intelligent -FilePath $file.FullName -Type "Type"
        if ($analysis) {
            $types += $analysis
            $totalFiles++
        }
    }
    Write-Color "     OK $($types.Count) types encontrados" $Gray
    
    return [PSCustomObject]@{
        Pages = $pages
        Components = $components
        Hooks = $hooks
        Services = $services
        APIs = $apis
        Types = $types
        TotalFiles = $totalFiles
        TotalViolations = $totalViolations
    }
}

# ============================================================
# GERADOR DE RELATORIOS
# ============================================================
function Generate-ComprehensiveReport {
    param($Results)
    
    Write-Color "  Gerando relatorios completos..." $Yellow
    Write-Host ""
    
    # 1. RELATORIO PRINCIPAL
    $reportPath = Join-Path $outputDir "RELATORIO_COMPLETO.md"
    
    $avgScore = 0
    $totalScore = 0
    $countScore = 0
    foreach ($file in $Results.Pages) { $totalScore += $file.Score; $countScore++ }
    foreach ($file in $Results.Components) { $totalScore += $file.Score; $countScore++ }
    foreach ($file in $Results.Hooks) { $totalScore += $file.Score; $countScore++ }
    if ($countScore -gt 0) { $avgScore = [math]::Round($totalScore / $countScore, 1) }
    
    $report = @"
# RELATORIO DE AUDITORIA COMPLETA - MODULO COZINHA
# Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")

---

## RESUMO EXECUTIVO

| Metrica | Valor |
|---------|-------|
| Total de arquivos analisados | $($Results.TotalFiles) |
| Paginas | $($Results.Pages.Count) |
| Componentes | $($Results.Components.Count) |
| Hooks | $($Results.Hooks.Count) |
| Services | $($Results.Services.Count) |
| APIs | $($Results.APIs.Count) |
| Types | $($Results.Types.Count) |
| Violacoes encontradas | $($Results.TotalViolations) |
| Nota Geral | $avgScore/10 |

---

## NOTA POR CATEGORIA

"@

    $pageScore = if ($Results.Pages.Count -gt 0) { [math]::Round(($Results.Pages | Measure-Object -Property Score -Average).Average, 1) } else { 0 }
    $compScore = if ($Results.Components.Count -gt 0) { [math]::Round(($Results.Components | Measure-Object -Property Score -Average).Average, 1) } else { 0 }
    $hookScore = if ($Results.Hooks.Count -gt 0) { [math]::Round(($Results.Hooks | Measure-Object -Property Score -Average).Average, 1) } else { 0 }
    $serviceScore = if ($Results.Services.Count -gt 0) { [math]::Round(($Results.Services | Measure-Object -Property Score -Average).Average, 1) } else { 0 }
    $apiScore = if ($Results.APIs.Count -gt 0) { [math]::Round(($Results.APIs | Measure-Object -Property Score -Average).Average, 1) } else { 0 }

    $report += @"
| Categoria | Nota | Status |
|-----------|------|--------|
| Paginas (UI) | $pageScore/10 | $(if ($pageScore -ge 7) { "OK" } else { "ATENCAO" }) |
| Componentes | $compScore/10 | $(if ($compScore -ge 7) { "OK" } else { "ATENCAO" }) |
| Hooks (Logica) | $hookScore/10 | $(if ($hookScore -ge 7) { "OK" } else { "ATENCAO" }) |
| Services | $serviceScore/10 | $(if ($serviceScore -ge 7) { "OK" } else { "ATENCAO" }) |
| APIs | $apiScore/10 | $(if ($apiScore -ge 7) { "OK" } else { "ATENCAO" }) |

---

## VIOLACOES DETECTADAS

"@

    $violationFiles = @()
    $violationFiles += $Results.Pages | Where-Object { $_.Violations.Count -gt 0 }
    $violationFiles += $Results.Components | Where-Object { $_.Violations.Count -gt 0 }
    $violationFiles += $Results.Hooks | Where-Object { $_.Violations.Count -gt 0 }
    $violationFiles += $Results.APIs | Where-Object { $_.Violations.Count -gt 0 }
    
    if ($violationFiles.Count -eq 0) {
        $report += "Nenhuma violacao encontrada!`n"
    } else {
        foreach ($file in $violationFiles | Sort-Object Score) {
            $report += "`n### $($file.Path)`n"
            $report += "- Tipo: $($file.Type)`n"
            $report += "- Linhas: $($file.Lines)`n"
            $report += "- Nota: $($file.Score)/10`n"
            $report += "Violacoes:`n"
            foreach ($v in $file.Violations) {
                $report += "  - $v`n"
            }
        }
    }

    $report += @"

---

## PLANO DE REFATORACAO

### PRIORIDADE ALTA (Corrigir Imediatamente)

"@

    $highPriority = @()
    $highPriority += $Results.Pages | Where-Object { $_.Violations -match "PAGE_ACCESS_DB" }
    $highPriority += $Results.Components | Where-Object { $_.Violations -match "COMPONENT_ACCESS_DB" }
    $highPriority += $Results.Pages | Where-Object { $_.Lines -gt 500 }
    
    if ($highPriority.Count -eq 0) {
        $report += "Nenhuma prioridade alta encontrada.`n"
    } else {
        foreach ($file in $highPriority | Sort-Object Score) {
            $report += "- $($file.Path) - $($file.Violations -join '; ')`n"
        }
    }

    $report += @"

### PRIORIDADE MEDIA (Refatorar em Breve)

"@

    $mediumPriority = @()
    $mediumPriority += $Results.Pages | Where-Object { $_.Lines -gt 300 -and $_.Lines -le 500 }
    $mediumPriority += $Results.Components | Where-Object { $_.Lines -gt 200 -and $_.Lines -le 250 }
    $mediumPriority += $Results.Hooks | Where-Object { $_.Lines -gt 200 -and $_.Lines -le 300 }
    
    if ($mediumPriority.Count -eq 0) {
        $report += "Nenhuma prioridade media encontrada.`n"
    } else {
        foreach ($file in $mediumPriority) {
            $report += "- $($file.Path) - $($file.Lines) linhas`n"
        }
    }

    $report += @"

### PRIORIDADE BAIXA (Melhorar Gradualmente)

"@

    $lowPriority = @()
    $lowPriority += $Results.Hooks | Where-Object { $_.HasJSX }
    $lowPriority += $Results.Components | Where-Object { $_.Violations -match "COMPONENT_STORAGE" }
    
    if ($lowPriority.Count -eq 0) {
        $report += "Nenhuma prioridade baixa encontrada.`n"
    } else {
        foreach ($file in $lowPriority) {
            $report += "- $($file.Path) - $($file.Violations -join '; ')`n"
        }
    }

    $report += @"

---

## MAPA DE ARQUITETURA

| Tela | Page | Componentes | Hooks | Services | APIs |
|------|------|-------------|-------|----------|------|
"@

    foreach ($page in $Results.Pages | Select-Object -First 10) {
        $pageName = $page.Path -replace '.*\\', ''
        $report += "`n| $pageName | OK | - | - | - |"
    }

    $report += @"

---

## RESUMO FINAL

- Arquivos analisados: $($Results.TotalFiles)
- Violacoes encontradas: $($Results.TotalViolations)
- Nota geral: $avgScore/10
- Status: $(if ($avgScore -ge 7) { "Arquitetura saudavel" } elseif ($avgScore -ge 5) { "Arquitetura com pontos a melhorar" } else { "Arquitetura critica - refatoracao necessaria" })

---
*Relatório gerado automaticamente pelo AUDITOR_INTELIGENTE_V2.ps1*
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Color "  OK RELATORIO_COMPLETO.md gerado" $Green
    
    # 2. ARQUIVO DE VIOLACOES
    $violationsPath = Join-Path $outputDir "VIOLACOES.csv"
    
    $csv = '"Arquivo","Tipo","Linhas","Score","Violacoes"'
    foreach ($file in $violationFiles) {
        $violations = $file.Violations -join '; '
        $csv += "`n`"$($file.Path)`",`"$($file.Type)`",$($file.Lines),$($file.Score),`"$violations`""
    }
    $csv | Out-File -FilePath $violationsPath -Encoding UTF8
    Write-Color "  OK VIOLACOES.csv gerado" $Green
    
    # 3. MAPA
    $mapPath = Join-Path $outputDir "MAPA_ARQUITETURA.txt"
    $map = @"
=====================================================================
MAPA DA ARQUITETURA - MODULO COZINHA
=====================================================================

PAGINAS ENCONTRADAS ($($Results.Pages.Count))
"@
    foreach ($page in $Results.Pages) {
        $map += "`n  $($page.Path) ($($page.Lines) linhas, nota: $($page.Score)/10)"
        if ($page.Violations.Count -gt 0) {
            $map += "`n     ATENCAO: $($page.Violations -join '; ')"
        }
    }
    
    $map += @"


COMPONENTES ENCONTRADOS ($($Results.Components.Count))
"@
    foreach ($comp in $Results.Components) {
        $map += "`n  $($comp.Path) ($($comp.Lines) linhas, nota: $($comp.Score)/10)"
        if ($comp.Violations.Count -gt 0) {
            $map += "`n     ATENCAO: $($comp.Violations -join '; ')"
        }
    }
    
    $map += @"


HOOKS ENCONTRADOS ($($Results.Hooks.Count))
"@
    foreach ($hook in $Results.Hooks) {
        $map += "`n  $($hook.Path) ($($hook.Lines) linhas, nota: $($hook.Score)/10)"
        if ($hook.Violations.Count -gt 0) {
            $map += "`n     ATENCAO: $($hook.Violations -join '; ')"
        }
    }
    
    $map += @"


SERVICES ENCONTRADOS ($($Results.Services.Count))
"@
    foreach ($service in $Results.Services) {
        $map += "`n  $($service.Path) ($($service.Lines) linhas)"
    }
    
    $map += @"


APIS ENCONTRADAS ($($Results.APIs.Count))
"@
    foreach ($api in $Results.APIs) {
        $map += "`n  $($api.Path) (nota: $($api.Score)/10)"
        if ($api.Violations.Count -gt 0) {
            $map += "`n     ATENCAO: $($api.Violations -join '; ')"
        }
    }
    
    $map | Out-File -FilePath $mapPath -Encoding UTF8
    Write-Color "  OK MAPA_ARQUITETURA.txt gerado" $Green
    
    Write-Host ""
    Write-Color "  OK Relatorios gerados em: $outputDir" $Green
}

# ============================================================
# PROGRAMA PRINCIPAL
# ============================================================

Show-Banner

if (-not (Test-Path $projectRoot)) {
    Write-Color "  ERRO: Projeto nao encontrado em: $projectRoot" $Red
    exit 1
}

$startTime = Get-Date
$results = Invoke-IntelligentAudit
$endTime = Get-Date

Generate-ComprehensiveReport -Results $results

# ============================================================
# RESUMO FINAL
# ============================================================
Write-Host ""
Write-Color "=====================================================================" $Cyan
Write-Color "  AUDITORIA INTELIGENTE CONCLUIDA                                    " $Green
Write-Color "=====================================================================" $Cyan
Write-Color ""
Write-Color "  RESUMO:" $Yellow
Write-Color "  Arquivos analisados: $($results.TotalFiles)" $White
Write-Color "  Paginas:          $($results.Pages.Count)" $White
Write-Color "  Componentes:      $($results.Components.Count)" $White
Write-Color "  Hooks:            $($results.Hooks.Count)" $White
Write-Color "  Services:         $($results.Services.Count)" $White
Write-Color "  APIs:             $($results.APIs.Count)" $White
Write-Color "  Types:            $($results.Types.Count)" $White
Write-Color "  Violacoes:        $($results.TotalViolations)" $Red
Write-Color ""
Write-Color "  Relatorios em: $outputDir" $Gray
Write-Color "  Tempo: $([math]::Round(($endTime - $startTime).TotalSeconds, 1))s" $Gray
Write-Color ""
Write-Color "  Relatorios gerados:" $Yellow
Write-Color "     - RELATORIO_COMPLETO.md" $White
Write-Color "     - VIOLACOES.csv" $White
Write-Color "     - MAPA_ARQUITETURA.txt" $White
Write-Host ""