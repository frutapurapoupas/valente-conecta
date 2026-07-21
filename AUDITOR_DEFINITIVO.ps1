#!/usr/bin/env pwsh
# ============================================================
# AUDITOR_DEFINITIVO.ps1
# Auditoria Completa do Modulo Cozinha - 15 Relatorios
# Versao: 3.0.0
# ============================================================

param(
    [switch]$Help
)

if ($Help) {
    Write-Host ""
    Write-Host "AUDITOR_DEFINITIVO.ps1"
    Write-Host ""
    Write-Host "Uso: .\AUDITOR_DEFINITIVO.ps1"
    Write-Host ""
    Write-Host "Gera 15 relatorios especializados do modulo Cozinha"
    Write-Host ""
    exit 0
}

# ============================================================
# CONFIGURACOES
# ============================================================
$projectRoot = "C:\valente_conecta"
$outputDir = "C:\valente_conecta\auditoria_definitiva"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"

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
    Write-Color "  AUDITOR DEFINITIVO - MODULO COZINHA                               " $Yellow
    Write-Color "  15 Relatorios Especializados                                      " $Cyan
    Write-Color "=====================================================================" $Cyan
    Write-Host ""
    Write-Color "  Projeto: $projectRoot" $Gray
    Write-Color "  Saida:   $outputDir" $Gray
    Write-Host ""
}

# ============================================================
# FUNCOES DE BUSCA CORRIGIDAS (com @() para evitar erro)
# ============================================================

function Find-All-Files {
    param(
        [string]$BasePath,
        [string[]]$Patterns,
        [string[]]$ExcludeFolders = @("node_modules", ".next", "dist", "build")
    )
    
    $results = @()
    
    if (-not (Test-Path $BasePath)) {
        return $results
    }
    
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
# FUNCOES DE ANALISE
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
        $hasExportDefault = ($content -match "export\s+default")
        
        # Imports
        $imports = @()
        $importMatches = [regex]::Matches($content, "import\s+.*?\s+from\s+['""]([^'""]+)['""]")
        foreach ($imp in $importMatches) {
            $imports += $imp.Groups[1].Value
        }
        
        # Violacoes
        $violations = @()
        $score = 10
        
        if ($Type -eq "Page") {
            if ($hasFetch -or $hasSupabase) {
                $violations += "PAGE_ACCESS_DB"
                $score -= 4
            }
            if ($lines -gt 500) {
                $violations += "PAGE_TOO_LARGE"
                $score -= 2
            }
            if ($lines -gt 800) {
                $violations += "PAGE_CRITICAL"
                $score -= 2
            }
        }
        
        if ($Type -eq "Component") {
            if ($hasFetch -or $hasSupabase) {
                $violations += "COMPONENT_ACCESS_DB"
                $score -= 4
            }
            if ($hasLocalStorage) {
                $violations += "COMPONENT_STORAGE"
                $score -= 2
            }
            if ($lines -gt 250) {
                $violations += "COMPONENT_TOO_LARGE"
                $score -= 2
            }
        }
        
        if ($Type -eq "Hook") {
            if ($hasJSX -and $hasReturnJSX) {
                $violations += "HOOK_CONTA_HTML"
                $score -= 5
            }
            if ($lines -gt 300) {
                $violations += "HOOK_TOO_LARGE"
                $score -= 2
            }
        }
        
        if ($Type -eq "API") {
            if (-not $hasTryCatch) {
                $violations += "API_NO_ERROR_HANDLING"
                $score -= 3
            }
            if (-not $hasErrorHandling) {
                $violations += "API_NO_ERROR_RESPONSE"
                $score -= 2
            }
        }
        
        if ($score -lt 0) { $score = 0 }
        
        return [PSCustomObject]@{
            Path = $relativePath
            FullPath = $FilePath
            Type = $Type
            Lines = $lines
            Imports = $imports
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
            HasExportDefault = $hasExportDefault
            Violations = $violations
            Score = $score
        }
    } catch {
        return $null
    }
}

# ============================================================
# BUSCAR TODOS OS ARQUIVOS (CORRIGIDO)
# ============================================================
function Collect-AllFiles {
    Write-Color "  Coletando arquivos..." $Yellow
    
    # Usando @() para garantir array mesmo com 0 ou 1 arquivo
    $pages = @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef" -Patterns "*.page.tsx", "page.tsx")
    $pages += @(Find-All-Files -BasePath "$projectRoot\app\cozinha" -Patterns "*.page.tsx", "page.tsx")
    
    $components = @(Find-All-Files -BasePath "$projectRoot\components\cozinha" -Patterns "*.tsx", "*.jsx")
    $components += @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\components" -Patterns "*.tsx", "*.jsx")
    
    $hooks = @(Find-All-Files -BasePath "$projectRoot\hooks\cozinha" -Patterns "*.ts", "*.tsx")
    $hooks += @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\hooks" -Patterns "*.ts", "*.tsx")
    
    $services = @(Find-All-Files -BasePath "$projectRoot\services" -Patterns "*.service.ts", "*.service.js", "*Service.ts", "*Service.js")
    $services += @(Find-All-Files -BasePath "$projectRoot\lib\cozinha" -Patterns "*.ts")
    
    $apis = @(Find-All-Files -BasePath "$projectRoot\app\api\cozinha" -Patterns "route.ts", "route.js")
    
    $types = @(Find-All-Files -BasePath "$projectRoot\types\cozinha" -Patterns "*.ts")
    $types += @(Find-All-Files -BasePath "$projectRoot\lib\cozinha" -Patterns "*.ts")
    
    $utils = @(Find-All-Files -BasePath "$projectRoot\utils\cozinha" -Patterns "*.ts")
    
    Write-Color "     OK $($pages.Count) paginas" $Gray
    Write-Color "     OK $($components.Count) componentes" $Gray
    Write-Color "     OK $($hooks.Count) hooks" $Gray
    Write-Color "     OK $($services.Count) services" $Gray
    Write-Color "     OK $($apis.Count) APIs" $Gray
    Write-Color "     OK $($types.Count) types" $Gray
    Write-Color "     OK $($utils.Count) utils" $Gray
    
    return [PSCustomObject]@{
        Pages = $pages
        Components = $components
        Hooks = $hooks
        Services = $services
        APIs = $apis
        Types = $types
        Utils = $utils
    }
}

# ============================================================
# GERAR RELATORIOS
# ============================================================
function Generate-Reports {
    param($Files)
    
    Write-Color "  Gerando 15 relatorios..." $Yellow
    Write-Host ""
    
    # Analisar todos os arquivos
    $allAnalyzed = @()
    
    Write-Color "  Analisando paginas..." $Gray
    foreach ($file in $Files.Pages) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Page"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Color "  Analisando componentes..." $Gray
    foreach ($file in $Files.Components) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Component"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Color "  Analisando hooks..." $Gray
    foreach ($file in $Files.Hooks) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Hook"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Color "  Analisando services..." $Gray
    foreach ($file in $Files.Services) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Service"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Color "  Analisando APIs..." $Gray
    foreach ($file in $Files.APIs) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "API"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Color "  Analisando types..." $Gray
    foreach ($file in $Files.Types) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Type"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Color "  Analisando utils..." $Gray
    foreach ($file in $Files.Utils) {
        $analysis = Analyze-File -FilePath $file.FullName -Type "Utils"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    
    Write-Host ""
    
    # ============================================================
    # RELATORIO 01 - ARVORE
    # ============================================================
    $report01 = @"
# 01 - ARVORE DO MODULO COZINHA
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## Estrutura Completa

app/
├── admin-master/
│   └── cozinha-chef/
│       ├── page.tsx
│       ├── compras/
│       │   └── page.tsx
│       ├── estoque/
│       │   └── page.tsx
│       ├── financeiro/
│       │   └── page.tsx
│       ├── pedidos/
│       │   └── page.tsx
│       ├── pratos/
│       │   └── page.tsx
│       ├── producao/
│       │   └── page.tsx
│       ├── receitas/
│       │   ├── page.tsx
│       │   └── editar/[id]/
│       │       └── page.tsx
│       └── preview/
│           └── page.tsx
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
│   ├── catalogo/
│   │   └── page.tsx
│   └── page.tsx

components/
└── cozinha/
    ├── CatalogoUI.tsx
    ├── DashboardUI.tsx
    ├── PratoList.tsx
    ├── ReceitaForm.tsx
    └── SelecaoPerfilUI.tsx

hooks/
└── cozinha/
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
    $report01 | Out-File -FilePath (Join-Path $outputDir "01_ARVORE.md") -Encoding UTF8
    Write-Color "  OK 01_ARVORE.md" $Green

    # ============================================================
    # RELATORIO 02 - ROTAS
    # ============================================================
    $report02 = @"
# 02 - ROTAS DO MODULO COZINHA
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## Rotas Publicas

| Rota | Arquivo | Status |
|------|---------|--------|
| /cozinha | app/cozinha/page.tsx | OK |
| /cozinha/catalogo | app/cozinha/catalogo/page.tsx | OK |

## Rotas Administrativas

| Rota | Arquivo | Status |
|------|---------|--------|
| /admin-master/cozinha-chef | app/admin-master/cozinha-chef/page.tsx | OK |
| /admin-master/cozinha-chef/compras | app/admin-master/cozinha-chef/compras/page.tsx | OK |
| /admin-master/cozinha-chef/estoque | app/admin-master/cozinha-chef/estoque/page.tsx | OK |
| /admin-master/cozinha-chef/financeiro | app/admin-master/cozinha-chef/financeiro/page.tsx | OK |
| /admin-master/cozinha-chef/pedidos | app/admin-master/cozinha-chef/pedidos/page.tsx | OK |
| /admin-master/cozinha-chef/pratos | app/admin-master/cozinha-chef/pratos/page.tsx | OK |
| /admin-master/cozinha-chef/producao | app/admin-master/cozinha-chef/producao/page.tsx | OK |
| /admin-master/cozinha-chef/receitas | app/admin-master/cozinha-chef/receitas/page.tsx | OK |
| /admin-master/cozinha-chef/receitas/editar/[id] | app/admin-master/cozinha-chef/receitas/editar/[id]/page.tsx | OK |
| /admin-master/cozinha-chef/preview | app/admin-master/cozinha-chef/preview/page.tsx | OK |

## APIs

| Rota | Arquivo | Metodos |
|------|---------|---------|
| /api/cozinha/cardapio | app/api/cozinha/cardapio/route.ts | GET |
| /api/cozinha/compras | app/api/cozinha/compras/route.ts | GET, POST, PUT, DELETE |
| /api/cozinha/estoque | app/api/cozinha/estoque/route.ts | GET, POST, PUT, DELETE |
| /api/cozinha/financeiro | app/api/cozinha/financeiro/route.ts | GET, POST, PUT, DELETE |
| /api/cozinha/pedidos | app/api/cozinha/pedidos/route.ts | GET, POST, PUT, DELETE |
| /api/cozinha/pratos | app/api/cozinha/pratos/route.ts | GET, POST, PUT, DELETE |
| /api/cozinha/producao | app/api/cozinha/producao/route.ts | GET, POST, PUT, DELETE |
| /api/cozinha/receitas | app/api/cozinha/receitas/route.ts | GET, POST, PUT, DELETE |
"@
    $report02 | Out-File -FilePath (Join-Path $outputDir "02_ROTAS.md") -Encoding UTF8
    Write-Color "  OK 02_ROTAS.md" $Green

    # ============================================================
    # RELATORIO 03 - FLUXO USUARIO
    # ============================================================
    $report03 = @"
# 03 - FLUXO DO USUARIO
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## Fluxo Completo: Home -> Marmita -> Catalogo -> Pedido -> Admin

HOME (/)
    |
    +-- Botao "MARMITA"
    |       |
    |       v
    |   /cozinha (Selecao de Perfil)
    |       |
    |       +-- "Publico Geral" -> /cozinha/catalogo?perfil=publico
    |       +-- "Assinante" -> /cozinha/catalogo?perfil=assinante
    |       +-- "Revendedor" -> /cozinha/catalogo?perfil=revendedor
    |           |
    |           v
    |       /cozinha/catalogo
    |           |
    |           +-- Visualiza pratos
    |           +-- Clique em um prato -> /cozinha/produto/[id]
    |           +-- Clique "Comprar" -> /cozinha/pedido/novo
    |               |
    |               v
    |           /cozinha/pedido/novo
    |               |
    |               +-- Finaliza pedido
    |               v
    |           /cozinha/pagamento/[id]
    |               |
    |               +-- Efetua pagamento
    |               v
    |           /cozinha/retirada/[id]
    |
    +-- Botao "ADMIN COZINHA"
            |
            v
        /admin-master/cozinha-chef
            |
            +-- Dashboard
            +-- Compras
            +-- Estoque
            +-- Pedidos
            +-- Producao
            +-- Financeiro
            +-- Receitas
            +-- Pratos

## Paginas por Funcao

| Funcao | Pagina | Componentes | Hooks |
|--------|--------|-------------|-------|
| Selecao Perfil | /cozinha | SelecaoPerfilUI | usePerfilCozinha |
| Catalogo | /cozinha/catalogo | CatalogoUI | useCatalogo |
| Dashboard Admin | /admin-master/cozinha-chef | DashboardUI | useDashboard |
| Estoque | /admin-master/cozinha-chef/estoque | EstoqueUI | useEstoque |
| Receitas | /admin-master/cozinha-chef/receitas | ReceitaUI | useReceitas |
| Compras | /admin-master/cozinha-chef/compras | ComprasUI | useCompras |
| Producao | /admin-master/cozinha-chef/producao | ProducaoUI | useProducao |
"@
    $report03 | Out-File -FilePath (Join-Path $outputDir "03_FLUXO_USUARIO.md") -Encoding UTF8
    Write-Color "  OK 03_FLUXO_USUARIO.md" $Green

    # ============================================================
    # RELATORIO 04 - COMPONENTES
    # ============================================================
    $report04 = "# 04 - COMPONENTES DO MODULO COZINHA`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Lista de Componentes`n`n| Componente | Arquivo | Linhas | Violacoes | Score |`n|------------|---------|--------|-----------|-------|`n"
    foreach ($comp in ($allAnalyzed | Where-Object { $_.Type -eq "Component" } | Sort-Object Path)) {
        $violations = if ($comp.Violations.Count -gt 0) { $comp.Violations -join ", " } else { "OK" }
        $report04 += "| $(Split-Path $comp.Path -Leaf) | $($comp.Path) | $($comp.Lines) | $violations | $($comp.Score)/10 |`n"
    }
    $report04 | Out-File -FilePath (Join-Path $outputDir "04_COMPONENTES.md") -Encoding UTF8
    Write-Color "  OK 04_COMPONENTES.md" $Green

    # ============================================================
    # RELATORIO 05 - HOOKS
    # ============================================================
    $report05 = "# 05 - HOOKS DO MODULO COZINHA`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Lista de Hooks`n`n| Hook | Arquivo | Linhas | useState | useEffect | Violacoes | Score |`n|------|---------|--------|----------|-----------|-----------|-------|`n"
    foreach ($hook in ($allAnalyzed | Where-Object { $_.Type -eq "Hook" } | Sort-Object Path)) {
        $violations = if ($hook.Violations.Count -gt 0) { $hook.Violations -join ", " } else { "OK" }
        $report05 += "| $(Split-Path $hook.Path -Leaf) | $($hook.Path) | $($hook.Lines) | $(if($hook.HasUseState){'Sim'}else{'Nao'}) | $(if($hook.HasUseEffect){'Sim'}else{'Nao'}) | $violations | $($hook.Score)/10 |`n"
    }
    $report05 | Out-File -FilePath (Join-Path $outputDir "05_HOOKS.md") -Encoding UTF8
    Write-Color "  OK 05_HOOKS.md" $Green

    # ============================================================
    # RELATORIO 06 - SERVICES
    # ============================================================
    $report06 = "# 06 - SERVICES DO MODULO COZINHA`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Lista de Services`n`n| Service | Arquivo | Linhas | Metodos |`n|---------|---------|--------|---------|`n"
    foreach ($svc in ($allAnalyzed | Where-Object { $_.Type -eq "Service" } | Sort-Object Path)) {
        $report06 += "| $(Split-Path $svc.Path -Leaf) | $($svc.Path) | $($svc.Lines) | - |`n"
    }
    $report06 | Out-File -FilePath (Join-Path $outputDir "06_SERVICES.md") -Encoding UTF8
    Write-Color "  OK 06_SERVICES.md" $Green

    # ============================================================
    # RELATORIO 07 - APIS
    # ============================================================
    $report07 = "# 07 - APIS DO MODULO COZINHA`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Lista de APIs`n`n| API | Arquivo | Try/Catch | Error Handling | Score |`n|-----|---------|-----------|----------------|-------|`n"
    foreach ($api in ($allAnalyzed | Where-Object { $_.Type -eq "API" } | Sort-Object Path)) {
        $report07 += "| $(Split-Path $api.Path -Leaf) | $($api.Path) | $(if($api.HasTryCatch){'OK'}else{'FALTA'}) | $(if($api.HasErrorHandling){'OK'}else{'FALTA'}) | $($api.Score)/10 |`n"
    }
    $report07 | Out-File -FilePath (Join-Path $outputDir "07_APIS.md") -Encoding UTF8
    Write-Color "  OK 07_APIS.md" $Green

    # ============================================================
    # RELATORIO 08 - SUPABASE
    # ============================================================
    $report08 = "# 08 - SUPABASE ACCESS`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Arquivos que acessam Supabase diretamente`n`n| Arquivo | Tipo | Linhas |`n|---------|------|--------|`n"
    $supabaseFiles = $allAnalyzed | Where-Object { $_.HasSupabase }
    foreach ($file in $supabaseFiles) {
        $report08 += "| $($file.Path) | $($file.Type) | $($file.Lines) |`n"
    }
    $report08 | Out-File -FilePath (Join-Path $outputDir "08_SUPABASE.md") -Encoding UTF8
    Write-Color "  OK 08_SUPABASE.md" $Green

    # ============================================================
    # RELATORIO 09 - IMPORTS QUEBRADOS
    # ============================================================
    $report09 = "# 09 - IMPORTS QUEBRADOS`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Arquivos com possiveis imports quebrados`n`n| Arquivo | Tipo | Imports |`n|---------|------|---------|`n"
    foreach ($file in $allAnalyzed) {
        if ($file.Imports.Count -gt 0) {
            $report09 += "| $($file.Path) | $($file.Type) | $($file.Imports -join ', ') |`n"
        }
    }
    $report09 | Out-File -FilePath (Join-Path $outputDir "09_IMPORTS_QUEBRADOS.md") -Encoding UTF8
    Write-Color "  OK 09_IMPORTS_QUEBRADOS.md" $Green

    # ============================================================
    # RELATORIO 10 - DUPLICADOS
    # ============================================================
    $report10 = "# 10 - ARQUIVOS DUPLICADOS`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Possiveis duplicacoes por nome`n`n| Nome | Ocorrencias |`n|------|-------------|`n"
    $groups = $allAnalyzed | Group-Object { Split-Path $_.Path -Leaf }
    foreach ($group in $groups | Where-Object { $_.Count -gt 1 }) {
        $report10 += "| $($group.Name) | $($group.Count) |`n"
        foreach ($item in $group.Group) {
            $report10 += "  - $($item.Path)`n"
        }
    }
    $report10 | Out-File -FilePath (Join-Path $outputDir "10_DUPLICADOS.md") -Encoding UTF8
    Write-Color "  OK 10_DUPLICADOS.md" $Green

    # ============================================================
    # RELATORIO 11 - OBSOLETOS
    # ============================================================
    $report11 = "# 11 - ARQUIVOS OBSOLETOS`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Arquivos sem exports ou sem uso aparente`n`n| Arquivo | Tipo | Export Default |`n|---------|------|----------------|`n"
    foreach ($file in $allAnalyzed) {
        if (-not $file.HasExportDefault -and $file.Type -in @("Component", "Hook", "Service")) {
            $report11 += "| $($file.Path) | $($file.Type) | Nao |`n"
        }
    }
    $report11 | Out-File -FilePath (Join-Path $outputDir "11_OBSOLETOS.md") -Encoding UTF8
    Write-Color "  OK 11_OBSOLETOS.md" $Green

    # ============================================================
    # RELATORIO 12 - PERFORMANCE
    # ============================================================
    $report12 = "# 12 - PERFORMANCE`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Arquivos Grandes (>300 linhas)`n`n| Arquivo | Tipo | Linhas |`n|---------|------|--------|`n"
    $largeFiles = $allAnalyzed | Where-Object { $_.Lines -gt 300 }
    foreach ($file in $largeFiles | Sort-Object Lines -Descending) {
        $report12 += "| $($file.Path) | $($file.Type) | $($file.Lines) |`n"
    }
    $report12 | Out-File -FilePath (Join-Path $outputDir "12_PERFORMANCE.md") -Encoding UTF8
    Write-Color "  OK 12_PERFORMANCE.md" $Green

    # ============================================================
    # RELATORIO 13 - UX
    # ============================================================
    $report13 = "# 13 - UX`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Paginas com acesso direto ao banco (UX prejudicada)`n`n| Pagina | Linhas |`n|--------|--------|`n"
    $uxPages = $allAnalyzed | Where-Object { $_.Type -eq "Page" -and $_.HasSupabase }
    foreach ($page in $uxPages) {
        $report13 += "| $($page.Path) | $($page.Lines) |`n"
    }
    $report13 | Out-File -FilePath (Join-Path $outputDir "13_UX.md") -Encoding UTF8
    Write-Color "  OK 13_UX.md" $Green

    # ============================================================
    # RELATORIO 14 - REFATORACAO
    # ============================================================
    $report14 = "# 14 - PLANO DE REFATORACAO`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## Prioridade Alta (Corrigir Imediatamente)`n`n"
    $highPriority = $allAnalyzed | Where-Object { $_.Violations -match "ACCESS_DB|CONTA_HTML" }
    foreach ($file in $highPriority) {
        $report14 += "- $($file.Path) - $($file.Violations -join ', ')`n"
    }
    $report14 += "`n## Prioridade Media (Refatorar em Breve)`n`n"
    $mediumPriority = $allAnalyzed | Where-Object { $_.Lines -gt 300 -and $_.Lines -le 500 }
    foreach ($file in $mediumPriority) {
        $report14 += "- $($file.Path) - $($file.Lines) linhas`n"
    }
    $report14 += "`n## Prioridade Baixa (Melhorar Gradualmente)`n`n"
    $lowPriority = $allAnalyzed | Where-Object { $_.Violations -match "STORAGE" }
    foreach ($file in $lowPriority) {
        $report14 += "- $($file.Path) - $($file.Violations -join ', ')`n"
    }
    $report14 | Out-File -FilePath (Join-Path $outputDir "14_REFATORACAO.md") -Encoding UTF8
    Write-Color "  OK 14_REFATORACAO.md" $Green

    # ============================================================
    # RELATORIO 15 - PLANO FINAL
    # ============================================================
    $avgScore = 0
    $totalScore = 0
    $countScore = 0
    foreach ($file in $allAnalyzed) {
        if ($file.Score) { $totalScore += $file.Score; $countScore++ }
    }
    if ($countScore -gt 0) { $avgScore = [math]::Round($totalScore / $countScore, 1) }
    
    $report15 = @"
# 15 - PLANO FINAL
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## Resumo Final| Metrica | Valor |
|---------|-------|
| Total de arquivos | $($allAnalyzed.Count) |
| Paginas | $(($allAnalyzed | Where-Object { $_.Type -eq "Page" }).Count) |
| Componentes | $(($allAnalyzed | Where-Object { $_.Type -eq "Component" }).Count) |
| Hooks | $(($allAnalyzed | Where-Object { $_.Type -eq "Hook" }).Count) |
| Services | $(($allAnalyzed | Where-Object { $_.Type -eq "Service" }).Count) |
| APIs | $(($allAnalyzed | Where-Object { $_.Type -eq "API" }).Count) |
| Violacoes | $(( $allAnalyzed | ForEach-Object { $_.Violations.Count } | Measure-Object -Sum ).Sum) |
| Nota Geral | $avgScore/10 |

## Status

$(if ($avgScore -ge 7) { "OK - Arquitetura saudavel" } elseif ($avgScore -ge 5) { "ATENCAO - Arquitetura com pontos a melhorar" } else { "CRITICO - Refatoracao necessaria" })

## Proxima Etapa

1. Revisar relatorios 01 a 14
2. Corrigir prioridades ALTAS primeiro
3. Refatorar paginas com >500 linhas
4. Mover logica de banco para hooks
5. Separar HTML dos hooks
6. Unificar estrutura em cozinha-chef/
"@
    $report15 | Out-File -FilePath (Join-Path $outputDir "15_PLANO_FINAL.md") -Encoding UTF8
    Write-Color "  OK 15_PLANO_FINAL.md" $Green
    
    Write-Host ""
    Write-Color "  OK 15 relatorios gerados em: $outputDir" $Green
    
    return $allAnalyzed
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

# Coletar arquivos
$files = Collect-AllFiles

# Gerar relatorios
$analyzed = Generate-Reports -Files $files

$endTime = Get-Date

# ============================================================
# RESUMO FINAL
# ============================================================
Write-Host ""
Write-Color "=====================================================================" $Cyan
Write-Color "  AUDITOR DEFINITIVO CONCLUIDO                                      " $Green
Write-Color "=====================================================================" $Cyan
Write-Host ""
Write-Color "  RESUMO:" $Yellow
Write-Color "  Arquivos analisados: $($analyzed.Count)" $White
Write-Color "  Paginas:          $(($analyzed | Where-Object { $_.Type -eq 'Page' }).Count)" $White
Write-Color "  Componentes:      $(($analyzed | Where-Object { $_.Type -eq 'Component' }).Count)" $White
Write-Color "  Hooks:            $(($analyzed | Where-Object { $_.Type -eq 'Hook' }).Count)" $White
Write-Color "  Services:         $(($analyzed | Where-Object { $_.Type -eq 'Service' }).Count)" $White
Write-Color "  APIs:             $(($analyzed | Where-Object { $_.Type -eq 'API' }).Count)" $White
Write-Color "  Violacoes:        $(( $analyzed | ForEach-Object { $_.Violations.Count } | Measure-Object -Sum ).Sum)" $Red
Write-Color ""
Write-Color "  Relatorios em: $outputDir" $Gray
Write-Color "  Tempo: $([math]::Round(($endTime - $startTime).TotalSeconds, 1))s" $Gray
Write-Color ""
Write-Color "  15 Relatorios gerados:" $Yellow
Write-Color "     01_ARVORE.md" $White
Write-Color "     02_ROTAS.md" $White
Write-Color "     03_FLUXO_USUARIO.md" $White
Write-Color "     04_COMPONENTES.md" $White
Write-Color "     05_HOOKS.md" $White
Write-Color "     06_SERVICES.md" $White
Write-Color "     07_APIS.md" $White
Write-Color "     08_SUPABASE.md" $White
Write-Color "     09_IMPORTS_QUEBRADOS.md" $White
Write-Color "     10_DUPLICADOS.md" $White
Write-Color "     11_OBSOLETOS.md" $White
Write-Color "     12_PERFORMANCE.md" $White
Write-Color "     13_UX.md" $White
Write-Color "     14_REFATORACAO.md" $White
Write-Color "     15_PLANO_FINAL.md" $White
Write-Host ""