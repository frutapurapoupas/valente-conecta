#!/usr/bin/env pwsh
# ============================================================
# VALENTE CONECTA - AUDITOR INTELIGENTE
# Versão Autossuficiente - CORRETA
# ============================================================

param(
    [string]$Modulo = "",
    [switch]$Ajuda
)

if ($Ajuda) {
    Write-Host ""
    Write-Host "🧠 AUDITOR INTELIGENTE - VALENTE CONECTA"
    Write-Host ""
    Write-Host "Uso: .\executar.ps1 [-Modulo <nome>]"
    Write-Host ""
    Write-Host "Exemplos:"
    Write-Host "  .\executar.ps1 -Modulo cozinha-chef"
    Write-Host "  .\executar.ps1 -Modulo cozinha-novo"
    Write-Host "  .\executar.ps1 (analisa todos os módulos)"
    Write-Host ""
    exit 0
}

$projectRoot = (Get-Location).Path

function Write-Color {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Color "╔══════════════════════════════════════════════════════════════╗" "Cyan"
    Write-Color "║                                                              ║" "Cyan"
    Write-Color "║   🧠  VALENTE CONECTA - AUDITOR INTELIGENTE                 ║" "Yellow"
    Write-Color "║                                                              ║" "Cyan"
    Write-Color "║   Análise de arquitetura, duplicações e refatoração          ║" "Cyan"
    Write-Color "║                                                              ║" "Cyan"
    Write-Color "╚══════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
    if ($Modulo) {
        Write-Color "  📂 Módulo: $Modulo" "Green"
    } else {
        Write-Color "  📂 Modo: Todos os módulos" "Green"
    }
    Write-Host ""
}

function Get-TodosModulos {
    $modulos = @()
    $pastas = Get-ChildItem -Path $projectRoot -Directory -Recurse -ErrorAction SilentlyContinue |
        Where-Object { 
            $_.Name -like "*cozinha*" -and 
            $_.FullName -match "app" -and
            $_.FullName -notmatch "node_modules|\.next"
        }
    foreach ($pasta in $pastas) {
        $modulos += @{
            Nome = $pasta.Name
            Path = $pasta.FullName
            RelativePath = $pasta.FullName.Replace($projectRoot, "").TrimStart('\')
        }
    }
    return $modulos | Sort-Object -Property Nome -Unique
}

function Scan-Pages {
    param([string]$Path)
    $pages = @()
    $patterns = @("*.page.tsx", "*.page.ts", "*.page.jsx", "*.page.js", "page.tsx", "page.ts", "index.tsx", "index.ts")
    foreach ($p in $patterns) {
        $found = Get-ChildItem -Path $Path -Recurse -File -Filter $p -ErrorAction SilentlyContinue
        $pages += $found
    }
    return $pages | Sort-Object -Property FullName -Unique
}

function Scan-Components {
    param([string]$Path)
    $components = @()
    $patterns = @("*.tsx", "*.jsx", "*.vue")
    foreach ($p in $patterns) {
        $found = Get-ChildItem -Path $Path -Recurse -File -Filter $p -ErrorAction SilentlyContinue
        $components += $found
    }
    $components = $components | Where-Object {
        $_.Name -notmatch "\.page\." -and
        $_.Name -notmatch "^page\." -and
        $_.Name -notmatch "^index\." -and
        $_.DirectoryName -notmatch "pages"
    }
    return $components | Sort-Object -Property FullName -Unique
}

function Scan-Hooks {
    param([string]$Path)
    $hooks = @()
    $patterns = @("use*.ts", "use*.tsx", "use*.js", "use*.jsx")
    foreach ($p in $patterns) {
        $found = Get-ChildItem -Path $Path -Recurse -File -Filter $p -ErrorAction SilentlyContinue
        $hooks += $found
    }
    return $hooks | Sort-Object -Property FullName -Unique
}

function Scan-Services {
    param([string]$Path)
    $services = @()
    $patterns = @("*Service.ts", "*Service.js", "*service.ts", "*service.js")
    foreach ($p in $patterns) {
        $found = Get-ChildItem -Path $Path -Recurse -File -Filter $p -ErrorAction SilentlyContinue
        $services += $found
    }
    $servicesPath = Join-Path $Path "services"
    if (Test-Path $servicesPath) {
        $found = Get-ChildItem -Path $servicesPath -File -Filter "*.ts" -ErrorAction SilentlyContinue
        $services += $found
        $found = Get-ChildItem -Path $servicesPath -File -Filter "*.js" -ErrorAction SilentlyContinue
        $services += $found
    }
    return $services | Sort-Object -Property FullName -Unique
}

function Scan-Api {
    param([string]$Path)
    $apis = @()
    $patterns = @("*.api.ts", "*.api.js", "*.route.ts", "*.route.js")
    foreach ($p in $patterns) {
        $found = Get-ChildItem -Path $Path -Recurse -File -Filter $p -ErrorAction SilentlyContinue
        $apis += $found
    }
    $apiPath = Join-Path $Path "api"
    if (Test-Path $apiPath) {
        $found = Get-ChildItem -Path $apiPath -File -Filter "*.ts" -ErrorAction SilentlyContinue
        $apis += $found
        $found = Get-ChildItem -Path $apiPath -File -Filter "*.js" -ErrorAction SilentlyContinue
        $apis += $found
    }
    return $apis | Sort-Object -Property FullName -Unique
}

function Scan-Supabase {
    param([string]$Path)
    $tabelas = @{}
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
            $texto = $content -join "`n"
            $matches = [regex]::Matches($texto, "\.from\(['""]([^'""]+)['""]\)")
            foreach ($match in $matches) {
                $tabela = $match.Groups[1].Value
                if (-not $tabelas.ContainsKey($tabela)) {
                    $tabelas[$tabela] = @{ Nome = $tabela; Arquivos = @() }
                }
                if ($file.Name -notin $tabelas[$tabela].Arquivos) {
                    $tabelas[$tabela].Arquivos += $file.Name
                }
            }
        } catch { }
    }
    return $tabelas
}

function Scan-Imports {
    param([string]$Path)
    $imports = @(); $quebrados = @()
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
            $texto = $content -join "`n"
            $matches = [regex]::Matches($texto, "import\s+.*?\s+from\s+['""]([^'""]+)['""]")
            foreach ($match in $matches) {
                $importPath = $match.Groups[1].Value
                $importInfo = @{ Arquivo = $file.Name; ImportPath = $importPath; IsQuebrado = $false }
                if ($importPath -match "^[@\.]") {
                    $resolved = $null
                    if ($importPath -match "^@") {
                        $clean = $importPath -replace "^@/", ""
                        $testPath = Join-Path $Path $clean
                        if (Test-Path $testPath) { $resolved = $testPath }
                        elseif (Test-Path "$testPath.ts") { $resolved = "$testPath.ts" }
                        elseif (Test-Path "$testPath.tsx") { $resolved = "$testPath.tsx" }
                        elseif (Test-Path "$testPath.js") { $resolved = "$testPath.js" }
                        elseif (Test-Path "$testPath.jsx") { $resolved = "$testPath.jsx" }
                    } else {
                        $dir = Split-Path $file.FullName -Parent
                        $clean = $importPath -replace "^\./", ""
                        $testPath = Join-Path $dir $clean
                        if (Test-Path $testPath) { $resolved = $testPath }
                        elseif (Test-Path "$testPath.ts") { $resolved = "$testPath.ts" }
                        elseif (Test-Path "$testPath.tsx") { $resolved = "$testPath.tsx" }
                        elseif (Test-Path "$testPath.js") { $resolved = "$testPath.js" }
                        elseif (Test-Path "$testPath.jsx") { $resolved = "$testPath.jsx" }
                    }
                    if (-not $resolved) {
                        $importInfo.IsQuebrado = $true
                        $quebrados += $importInfo
                    }
                }
                $imports += $importInfo
            }
        } catch { }
    }
    return @{ Total = $imports.Count; Quebrados = $quebrados; QuebradosCount = $quebrados.Count }
}

function Analyze-UX {
    param([string]$Path)
    $componentes = @()
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(tsx|jsx)$" -and $_.DirectoryName -match "components" }
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -ErrorAction SilentlyContinue
            $texto = $content -join "`n"
            $comp = @{
                Nome = $file.Name
                Loading = ($texto -match "loading|isLoading|skeleton|spinner")
                Error = ($texto -match "error|isError|fail|catch")
                Empty = ($texto -match "empty|noData|noItems|vazio")
                Acessibilidade = @()
            }
            if ($texto -match "aria-|role=") { $comp.Acessibilidade += "ARIA" }
            if ($texto -match "alt=") { $comp.Acessibilidade += "ALT" }
            if ($texto -match "label=") { $comp.Acessibilidade += "LABEL" }
            $componentes += $comp
        } catch { }
    }
    $total = $componentes.Count; if ($total -eq 0) { $total = 1 }
    $score = 50
    $comLoading = ($componentes | Where-Object { $_.Loading }).Count
    $comError = ($componentes | Where-Object { $_.Error }).Count
    $comEmpty = ($componentes | Where-Object { $_.Empty }).Count
    $comA11y = ($componentes | Where-Object { $_.Acessibilidade.Count -gt 0 }).Count
    if ($comLoading / $total -gt 0.5) { $score += 15 }
    if ($comError / $total -gt 0.5) { $score += 10 }
    if ($comEmpty / $total -gt 0.3) { $score += 10 }
    if ($comA11y / $total -gt 0.3) { $score += 15 }
    return @{ Pontuacao = [math]::Min(100, $score); Componentes = $componentes; Total = $total }
}

function Analyze-Performance {
    param([string]$Path)
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    $performance = @{ TotalArquivos = $files.Count; TotalLinhas = 0; ArquivosGrandes = @(); MediaLinhas = 0; Pontuacao = 100 }
    foreach ($file in $files) {
        $lines = (Get-Content $file.FullName -ErrorAction SilentlyContinue).Count
        $performance.TotalLinhas += $lines
        if ($lines -gt 500) {
            $performance.ArquivosGrandes += @{ Nome = $file.Name; Linhas = $lines }
        }
    }
    if ($performance.TotalArquivos -gt 0) {
        $performance.MediaLinhas = [math]::Round($performance.TotalLinhas / $performance.TotalArquivos, 0)
    }
    $score = 100
    if ($performance.ArquivosGrandes.Count -gt 0) { $score -= [math]::Min(20, $performance.ArquivosGrandes.Count * 5) }
    if ($performance.MediaLinhas -gt 300) { $score -= 10 } 
    elseif ($performance.MediaLinhas -gt 200) { $score -= 5 }
    $performance.Pontuacao = [math]::Max(0, $score)
    return $performance
}

function Find-Duplicates {
    param([string]$Path)
    $duplicados = @()
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    $porNome = $files | Group-Object -Property Name
    foreach ($grupo in $porNome) {
        if ($grupo.Count -gt 1) {
            $duplicados += @{ Nome = $grupo.Name; Arquivos = $grupo.Group | ForEach-Object { $_.FullName } }
        }
    }
    return $duplicados
}

function Find-DeadFiles {
    param([string]$Path)
    $mortos = @()
    $files = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    foreach ($file in $files) {
        if ($file.Name -match "^_app|^_document|^_error|^index\.") { continue }
        if ($file.Name -match "\.config\.|\.test\.|\.spec\.") { continue }
        $referenciado = $false
        $nomeBase = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        foreach ($outro in $files) {
            if ($outro.FullName -eq $file.FullName) { continue }
            try {
                $outroContent = Get-Content $outro.FullName -ErrorAction SilentlyContinue
                $outroTexto = $outroContent -join "`n"
                if ($outroTexto -match $nomeBase) { $referenciado = $true; break }
            } catch { }
        }
        if (-not $referenciado) {
            $mortos += @{ Nome = $file.Name; Caminho = $file.FullName; Tamanho = $file.Length; Pasta = $file.Directory.Name }
        }
    }
    return $mortos
}

function Generate-Report {
    param($Dados, [string]$OutputDir)
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $reportFile = Join-Path $OutputDir "relatorio_$timestamp.md"
    $conteudo = @"
# 📊 RELATÓRIO DE AUDITORIA - COZINHA

## 📋 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Módulo** | $($Dados.Modulo) |
| **Total de arquivos** | $($Dados.TotalArquivos) |
| **Páginas** | $($Dados.Pages.Count) |
| **Componentes** | $($Dados.Components.Count) |
| **Hooks** | $($Dados.Hooks.Count) |
| **Services** | $($Dados.Services.Count) |
| **APIs** | $($Dados.Api.Count) |
| **Tabelas Supabase** | $($Dados.Supabase.Count) |
| **Imports totais** | $($Dados.Imports.Total) |
| **Imports quebrados** | $($Dados.Imports.QuebradosCount) |
| **Arquivos duplicados** | $($Dados.Duplicados.Count) |
| **Arquivos mortos** | $($Dados.Mortos.Count) |
| **Performance Score** | $($Dados.Performance.Pontuacao)/100 |
| **UX Score** | $($Dados.UX.Pontuacao)/100 |

---

## 📄 Páginas ($($Dados.Pages.Count))

"@
    foreach ($page in $Dados.Pages) {
        $conteudo += "- $($page.Name)`n"
    }
    $conteudo += @"

---

## 🧩 Componentes ($($Dados.Components.Count))

"@
    foreach ($comp in $Dados.Components | Select-Object -First 30) {
        $conteudo += "- $($comp.Name)`n"
    }
    if ($Dados.Components.Count -gt 30) {
        $conteudo += "... e mais $($Dados.Components.Count - 30) componentes`n"
    }
    $conteudo += @"

---

## 🪝 Hooks ($($Dados.Hooks.Count))

"@
    foreach ($hook in $Dados.Hooks) { $conteudo += "- $($hook.Name)`n" }
    $conteudo += @"

---

## 🔧 Services ($($Dados.Services.Count))

"@
    foreach ($svc in $Dados.Services) { $conteudo += "- $($svc.Name)`n" }
    $conteudo += @"

---

## 🌐 APIs ($($Dados.Api.Count))

"@
    foreach ($api in $Dados.Api) { $conteudo += "- $($api.Name)`n" }
    $conteudo += @"

---

## 🗄️ Supabase ($($Dados.Supabase.Count))

"@
    if ($Dados.Supabase.Count -eq 0) { $conteudo += "Nenhuma tabela encontrada.`n" }
    else { foreach ($tabela in $Dados.Supabase.Keys) { $conteudo += "- **$tabela**`n" } }
    $conteudo += @"

---

## 📦 Imports

- **Total:** $($Dados.Imports.Total)
- **Quebrados:** $($Dados.Imports.QuebradosCount)

"@
    if ($Dados.Imports.QuebradosCount -gt 0) {
        $conteudo += "### Imports quebrados:`n"
        foreach ($imp in $Dados.Imports.Quebrados | Select-Object -First 30) {
            $conteudo += "- $($imp.Arquivo): $($imp.ImportPath)`n"
        }
    } else { $conteudo += "✅ Todos os imports estão resolvendo!`n" }
    $conteudo += @"

---

## 🔄 Duplicados ($($Dados.Duplicados.Count))

"@
    if ($Dados.Duplicados.Count -eq 0) { $conteudo += "✅ Nenhum duplicado!`n" }
    else {
        foreach ($dup in $Dados.Duplicados | Select-Object -First 20) {
            $conteudo += "### $($dup.Nome)`n"
            foreach ($arq in $dup.Arquivos) { $conteudo += "- $arq`n" }
            $conteudo += "`n"
        }
    }
    $conteudo += @"

---

## 💀 Arquivos Mortos ($($Dados.Mortos.Count))

"@
    if ($Dados.Mortos.Count -eq 0) { $conteudo += "✅ Nenhum arquivo morto!`n" }
    else {
        foreach ($morto in $Dados.Mortos | Select-Object -First 30) {
            $conteudo += "- $($morto.Nome)`n"
        }
    }
    $conteudo += @"

---

## ⚡ Performance: $($Dados.Performance.Pontuacao)/100

- Arquivos: $($Dados.Performance.TotalArquivos)
- Linhas totais: $($Dados.Performance.TotalLinhas)
- Média: $($Dados.Performance.MediaLinhas)
- Arquivos >500 linhas: $($Dados.Performance.ArquivosGrandes.Count)

---

## 🎨 UX: $($Dados.UX.Pontuacao)/100

- Componentes analisados: $($Dados.UX.Total)

---

## 🎯 Recomendações

"@
    if ($Dados.Imports.QuebradosCount -gt 0) { $conteudo += "- ⚠️ Corrigir $($Dados.Imports.QuebradosCount) imports quebrados`n" }
    if ($Dados.Duplicados.Count -gt 0) { $conteudo += "- ⚠️ Eliminar $($Dados.Duplicados.Count) duplicados`n" }
    if ($Dados.Mortos.Count -gt 0) { $conteudo += "- 📦 Remover $($Dados.Mortos.Count) arquivos mortos`n" }
    if ($Dados.Performance.Pontuacao -lt 70) { $conteudo += "- 🚀 Melhorar performance ($($Dados.Performance.Pontuacao)/100)`n" }
    if ($Dados.UX.Pontuacao -lt 70) { $conteudo += "- 🎨 Melhorar UX ($($Dados.UX.Pontuacao)/100)`n" }
    $conteudo += @"
---
*Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")*
"@
    $conteudo | Out-File -FilePath $reportFile -Encoding UTF8
    return $reportFile
}

# ============================================================
# PROGRAMA PRINCIPAL
# ============================================================

Show-Banner

if (-not (Test-Path (Join-Path $projectRoot "app"))) {
    Write-Color "  ❌ Pasta 'app' não encontrada!" "Red"
    exit 1
}

if ($Modulo) {
    Write-Color "  🔍 Localizando módulo '$Modulo'..." "Gray"
    $moduloPath = $null
    $possiveis = @("app/$Modulo", "app/$Modulo/pages", "app/admin-master/$Modulo", "app/admin-master/$Modulo/pages")
    foreach ($p in $possiveis) {
        $full = Join-Path $projectRoot $p
        if (Test-Path $full) { $moduloPath = $full; break }
    }
    if (-not $moduloPath) {
        $found = Get-ChildItem -Path $projectRoot -Directory -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -eq $Modulo -and $_.FullName -match "app" } | Select-Object -First 1
        if ($found) { $moduloPath = $found.FullName }
    }
    if (-not $moduloPath) {
        Write-Color "  ❌ Módulo '$Modulo' não encontrado!" "Red"
        exit 1
    }
    Write-Color "  ✅ Módulo em: $moduloPath" "Green"
    Write-Host ""
    
    Write-Color "  🔍 Escaneando..." "Yellow"
    $pages = Scan-Pages $moduloPath
    $components = Scan-Components $moduloPath
    $hooks = Scan-Hooks $moduloPath
    $services = Scan-Services $moduloPath
    $api = Scan-Api $moduloPath
    $supabase = Scan-Supabase $moduloPath
    $imports = Scan-Imports $moduloPath
    $ux = Analyze-UX $moduloPath
    $performance = Analyze-Performance $moduloPath
    $duplicados = Find-Duplicates $moduloPath
    $mortos = Find-DeadFiles $moduloPath
    $allFiles = Get-ChildItem -Path $moduloPath -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    
    $dados = @{
        Modulo = $Modulo
        Path = $moduloPath
        Pages = $pages
        Components = $components
        Hooks = $hooks
        Services = $services
        Api = $api
        Supabase = $supabase
        Imports = $imports
        UX = $ux
        Performance = $performance
        Duplicados = $duplicados
        Mortos = $mortos
        TotalArquivos = $allFiles.Count
    }
    
    Write-Host ""
    Write-Color "  📄 Gerando relatório..." "Yellow"
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
    $outputDir = Join-Path $projectRoot "auditoria_$timestamp"
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    $reportFile = Generate-Report -Dados $dados -OutputDir $outputDir
    Write-Color "  ✅ Relatório: $reportFile" "Green"
    Write-Color "  📁 Pasta: $outputDir" "White"
    exit 0
}

# Modo: todos os módulos
Write-Color "  🔍 Buscando módulos..." "Gray"
$todos = Get-TodosModulos
if ($todos.Count -eq 0) {
    Write-Color "  ❌ Nenhum módulo encontrado!" "Red"
    exit 1
}
Write-Color "  ✅ $($todos.Count) módulos encontrados" "Green"
Write-Host ""

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$outputDir = Join-Path $projectRoot "auditoria_$timestamp"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

foreach ($mod in $todos) {
    Write-Color "  📂 $($mod.Nome)" "Yellow"
    $pages = Scan-Pages $mod.Path
    $components = Scan-Components $mod.Path
    $hooks = Scan-Hooks $mod.Path
    $services = Scan-Services $mod.Path
    $api = Scan-Api $mod.Path
    $supabase = Scan-Supabase $mod.Path
    $imports = Scan-Imports $mod.Path
    $ux = Analyze-UX $mod.Path
    $performance = Analyze-Performance $mod.Path
    $duplicados = Find-Duplicates $mod.Path
    $mortos = Find-DeadFiles $mod.Path
    $allFiles = Get-ChildItem -Path $mod.Path -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -match "\.(ts|tsx|js|jsx)$" }
    
    $dados = @{
        Modulo = $mod.Nome
        Path = $mod.Path
        Pages = $pages
        Components = $components
        Hooks = $hooks
        Services = $services
        Api = $api
        Supabase = $supabase
        Imports = $imports
        UX = $ux
        Performance = $performance
        Duplicados = $duplicados
        Mortos = $mortos
        TotalArquivos = $allFiles.Count
    }
    $reportFile = Generate-Report -Dados $dados -OutputDir $outputDir
    Write-Color "     ✅ $($mod.Nome) - $($dados.TotalArquivos) arquivos" "Green"
}
Write-Host ""
Write-Color "  ✅ Auditoria concluída!" "Green"
Write-Color "  📁 Relatórios em: $outputDir" "White"
