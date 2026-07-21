#!/usr/bin/env pwsh
# ============================================================
# AUDITOR_ERP_COZINHA.ps1
# Auditoria Completa do Módulo Cozinha - Visão ERP
# Versao: 4.0.0
# ============================================================

param(
    [switch]$Help
)

if ($Help) {
    Write-Host ""
    Write-Host "AUDITOR_ERP_COZINHA.ps1"
    Write-Host ""
    Write-Host "Uso: .\AUDITOR_ERP_COZINHA.ps1"
    Write-Host ""
    Write-Host "Gera diagnostico completo do modulo Cozinha com visao ERP"
    Write-Host ""
    exit 0
}

# ============================================================
# CONFIGURACOES
# ============================================================
$projectRoot = "C:\valente_conecta"
$outputDir = "C:\valente_conecta\auditoria_erp"
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
    Write-Color "  AUDITOR ERP COZINHA                                               " $Yellow
    Write-Color "  Visao Completa do Modulo com Fluxo de Negocio                     " $Cyan
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
        [string[]]$Patterns
    )
    
    $results = @()
    if (-not (Test-Path $BasePath)) { return $results }
    
    foreach ($pattern in $Patterns) {
        $files = Get-ChildItem -Path $BasePath -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($file.FullName -notmatch "node_modules|\.next|dist|build") {
                $results += $file
            }
        }
    }
    return $results | Sort-Object -Property FullName -Unique
}

# ============================================================
# ANALISE DE ARQUIVO COMPLETA
# ============================================================
function Analyze-File-Complete {
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
        $hasJSX = ($content -match "<\s*[A-Z]") -or ($content -match "<\s*div")
        $hasUseState = ($content -match "useState\s*\(")
        $hasUseEffect = ($content -match "useEffect\s*\(")
        $hasRouter = ($content -match "useRouter|router\.")
        $hasForm = ($content -match "form|onSubmit")
        
        # Imports
        $imports = @()
        $importMatches = [regex]::Matches($content, "import\s+.*?\s+from\s+['""]([^'""]+)['""]")
        foreach ($imp in $importMatches) {
            $imports += $imp.Groups[1].Value
        }
        
        # Exportacoes
        $hasExportDefault = ($content -match "export\s+default")
        $hasExportNamed = ($content -match "export\s+\{")
        
        return [PSCustomObject]@{
            Path = $relativePath
            FullPath = $FilePath
            Type = $Type
            Lines = $lines
            HasFetch = $hasFetch
            HasSupabase = $hasSupabase
            HasJSX = $hasJSX
            HasUseState = $hasUseState
            HasUseEffect = $hasUseEffect
            HasRouter = $hasRouter
            HasForm = $hasForm
            HasExportDefault = $hasExportDefault
            HasExportNamed = $hasExportNamed
            Imports = $imports
            Score = 10
        }
    } catch {
        return $null
    }
}

# ============================================================
# MAPEAMENTO DE ROTAS
# ============================================================
function Map-Routes {
    param($Files)
    
    $routes = @()
    
    foreach ($file in $Files) {
        if ($file.Type -eq "Page" -or $file.Type -eq "API") {
            # Extrai a rota do caminho
            $route = $file.Path -replace "app\\", "" -replace "\\page\.tsx$", "" -replace "\\route\.ts$", ""
            $route = $route -replace "\\", "/"
            if ($route -eq "") { $route = "/" }
            
            $routes += [PSCustomObject]@{
                Route = $route
                File = $file.Path
                Type = $file.Type
                HasForm = $file.HasForm
                HasRouter = $file.HasRouter
                Lines = $file.Lines
            }
        }
    }
    
    return $routes | Sort-Object Route
}

# ============================================================
# MAPEAMENTO DE DEPENDENCIAS
# ============================================================
function Map-Dependencies {
    param($AllFiles)
    
    $deps = @{}
    
    foreach ($file in $AllFiles) {
        $fileName = $file.Path -replace '.*\\', ''
        $deps[$fileName] = $file.Imports
    }
    
    return $deps
}

# ============================================================
# FUNCAO PRINCIPAL
# ============================================================
function Invoke-ERPAudit {
    Write-Color "  Iniciando auditoria ERP..." $Yellow
    Write-Host ""
    
    # 1. BUSCAR TODOS OS ARQUIVOS
    Write-Color "  Buscando arquivos..." $Cyan
    
    $pages = @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef" -Patterns "page.tsx", "*.page.tsx")
    $pages += @(Find-All-Files -BasePath "$projectRoot\app\cozinha" -Patterns "page.tsx", "*.page.tsx")
    
    $components = @(Find-All-Files -BasePath "$projectRoot\components\cozinha" -Patterns "*.tsx", "*.jsx")
    $components += @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\components" -Patterns "*.tsx", "*.jsx")
    
    $hooks = @(Find-All-Files -BasePath "$projectRoot\hooks\cozinha" -Patterns "*.ts", "*.tsx")
    $hooks += @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\hooks" -Patterns "*.ts", "*.tsx")
    
    $services = @(Find-All-Files -BasePath "$projectRoot\services" -Patterns "*.service.ts", "*.service.js", "*Service.ts")
    $services += @(Find-All-Files -BasePath "$projectRoot\app\admin-master\cozinha-chef\services" -Patterns "*.ts", "*.js")
    
    $apis = @(Find-All-Files -BasePath "$projectRoot\app\api\cozinha" -Patterns "route.ts", "route.js")
    
    $types = @(Find-All-Files -BasePath "$projectRoot\types\cozinha" -Patterns "*.ts")
    $types += @(Find-All-Files -BasePath "$projectRoot\lib\cozinha" -Patterns "*.ts")
    
    Write-Color "     OK $($pages.Count) paginas" $Gray
    Write-Color "     OK $($components.Count) componentes" $Gray
    Write-Color "     OK $($hooks.Count) hooks" $Gray
    Write-Color "     OK $($services.Count) services" $Gray
    Write-Color "     OK $($apis.Count) APIs" $Gray
    Write-Color "     OK $($types.Count) types" $Gray
    
    # 2. ANALISAR ARQUIVOS
    Write-Color ""
    Write-Color "  Analisando arquivos..." $Cyan
    
    $allAnalyzed = @()
    
    foreach ($file in $pages) {
        $analysis = Analyze-File-Complete -FilePath $file.FullName -Type "Page"
        if ($analysis) { $allAnalyzed += $analysis }
    }
    Write-Color "     OK $($allAnalyzed.Count) arquivos analisados" $Gray
    
    # 3. MAPEAR ROTAS
    $routes = Map-Routes -Files $allAnalyzed
    
    # 4. MAPEAR DEPENDENCIAS
    $dependencies = Map-Dependencies -AllFiles $allAnalyzed
    
    # 5. IDENTIFICAR VIOLACOES
    $violations = @()
    foreach ($file in $allAnalyzed) {
        if ($file.Type -eq "Page" -and $file.HasSupabase) {
            $violations += "PAGE_ACCESS_DB: $($file.Path)"
        }
        if ($file.Type -eq "Component" -and $file.HasSupabase) {
            $violations += "COMPONENT_ACCESS_DB: $($file.Path)"
        }
        if ($file.Type -eq "Page" -and $file.Lines -gt 500) {
            $violations += "PAGE_TOO_LARGE: $($file.Path) - $($file.Lines) linhas"
        }
    }
    
    return [PSCustomObject]@{
        Pages = $pages
        Components = $components
        Hooks = $hooks
        Services = $services
        APIs = $apis
        Types = $types
        AllFiles = $allAnalyzed
        Routes = $routes
        Dependencies = $dependencies
        Violations = $violations
        TotalFiles = $allAnalyzed.Count
        TotalPages = $pages.Count
        TotalComponents = $components.Count
        TotalHooks = $hooks.Count
        TotalServices = $services.Count
        TotalAPIs = $apis.Count
        TotalTypes = $types.Count
        TotalViolations = $violations.Count
    }
}

# ============================================================
# GERADOR DE RELATORIOS ERP
# ============================================================
function Generate-ERPReports {
    param($Results)
    
    Write-Color "  Gerando relatorios ERP..." $Yellow
    Write-Host ""
    
    # ============================================================
    # RELATORIO 01 - MAPA COMPLETO
    # ============================================================
    $report01 = @"
# 01 - MAPA COMPLETO DO MODULO COZINHA
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## ARQUIVOS POR TIPO

| Tipo | Quantidade |
|------|------------|
| Paginas | $($Results.TotalPages) |
| Componentes | $($Results.TotalComponents) |
| Hooks | $($Results.TotalHooks) |
| Services | $($Results.TotalServices) |
| APIs | $($Results.TotalAPIs) |
| Types | $($Results.TotalTypes) |
| **Total** | **$($Results.TotalFiles)** |

## ESTRUTURA ATUAL

app/
├── admin-master/
│   └── cozinha-chef/
│       ├── page.tsx (Dashboard)
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
"@
    $report01 | Out-File -FilePath (Join-Path $outputDir "01_MAPA_COMPLETO.md") -Encoding UTF8
    Write-Color "  OK 01_MAPA_COMPLETO.md" $Green

    # ============================================================
    # RELATORIO 02 - ROTAS E NAVEGACAO
    # ============================================================
    $report02 = @"
# 02 - ROTAS E NAVEGACAO
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## ROTAS PUBLICAS

| Rota | Arquivo | Status |
|------|---------|--------|
| /cozinha | app/cozinha/page.tsx | Publico |
| /cozinha/catalogo | app/cozinha/catalogo/page.tsx | Publico |

## ROTAS ADMINISTRATIVAS

| Rota | Arquivo | Funcao |
|------|---------|--------|
| /admin-master/cozinha-chef | cozinha-chef/page.tsx | Dashboard |
| /admin-master/cozinha-chef/receitas | cozinha-chef/receitas/page.tsx | Gerenciar Receitas |
| /admin-master/cozinha-chef/receitas/editar/[id] | cozinha-chef/receitas/editar/[id]/page.tsx | Editar Receita |
| /admin-master/cozinha-chef/pratos | cozinha-chef/pratos/page.tsx | Gerenciar Pratos |
| /admin-master/cozinha-chef/estoque | cozinha-chef/estoque/page.tsx | Gerenciar Estoque |
| /admin-master/cozinha-chef/compras | cozinha-chef/compras/page.tsx | Lista de Compras |
| /admin-master/cozinha-chef/producao | cozinha-chef/producao/page.tsx | Producao |
| /admin-master/cozinha-chef/pedidos | cozinha-chef/pedidos/page.tsx | Pedidos |
| /admin-master/cozinha-chef/financeiro | cozinha-chef/financeiro/page.tsx | Financeiro |
| /admin-master/cozinha-chef/preview | cozinha-chef/preview/page.tsx | Preview Cardapio |

## APIs

| Rota | Metodos |
|------|---------|
| /api/cozinha/receitas | GET, POST, PUT, DELETE |
| /api/cozinha/estoque | GET, POST, PUT, DELETE |
| /api/cozinha/compras | GET, POST, PUT, DELETE |
| /api/cozinha/producao | GET, POST, PUT, DELETE |
| /api/cozinha/pedidos | GET, POST, PUT, DELETE |
| /api/cozinha/cardapio | GET |
"@
    $report02 | Out-File -FilePath (Join-Path $outputDir "02_ROTAS_NAVEGACAO.md") -Encoding UTF8
    Write-Color "  OK 02_ROTAS_NAVEGACAO.md" $Green

    # ============================================================
    # RELATORIO 03 - FLUXO DE NEGOCIO
    # ============================================================
    $report03 = @"
# 03 - FLUXO DE NEGOCIO
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## FLUXO IDEAL (RECEITA COMO CORACAO)

RECEITA
    │
    ├── Ingredientes
    │   ├── Verifica Estoque
    │   │   ├── Existe → Usa preco
    │   │   └── Nao existe → Cria novo
    │   └── Calcula Custo
    │
    ├── Prato
    │   ├── Categoria
    │   ├── Preco
    │   └── Disponibilidade
    │
    ├── Producao
    │   ├── Quantidade
    │   ├── Calcula Necessidade
    │   └── Consumo Estoque
    │
    ├── Lista de Compras
    │   ├── Gera automaticamente
    │   ├── Aprovacao
    │   └── Compra
    │
    ├── Preview Cardapio
    │   ├── Selecao por dia
    │   └── Publicacao
    │
    └── Catalogo Publico
        ├── Exibicao
        ├── Pedidos
        └── Producao

## FLUXO ATUAL (MApeado)

"@

    # Adiciona o fluxo atual baseado nas rotas
    $report03 += @"
## PAGINAS POR FUNCAO

| Funcao | Pagina | Status |
|--------|--------|--------|
| Receitas | /admin-master/cozinha-chef/receitas | OK |
| Pratos | /admin-master/cozinha-chef/pratos | OK |
| Estoque | /admin-master/cozinha-chef/estoque | OK |
| Compras | /admin-master/cozinha-chef/compras | OK |
| Producao | /admin-master/cozinha-chef/producao | OK |
| Pedidos | /admin-master/cozinha-chef/pedidos | OK |
| Financeiro | /admin-master/cozinha-chef/financeiro | OK |
| Preview | /admin-master/cozinha-chef/preview | OK |
| Dashboard | /admin-master/cozinha-chef | OK |

## GAPS IDENTIFICADOS

1. Receita nao gera Prato automaticamente
2. Producao nao consome Estoque
3. Lista de Compras nao e gerada automaticamente
4. Preview nao esta conectado ao Catalogo
5. Pedidos nao alimentam Producao
"@
    $report03 | Out-File -FilePath (Join-Path $outputDir "03_FLUXO_NEGOCIO.md") -Encoding UTF8
    Write-Color "  OK 03_FLUXO_NEGOCIO.md" $Green

    # ============================================================
    # RELATORIO 04 - DEPENDENCIAS
    # ============================================================
    $report04 = "# 04 - DEPENDENCIAS`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## MAPA DE DEPENDENCIAS`n`n| Arquivo | Depende de |`n|---------|------------|`n"
    foreach ($key in $Results.Dependencies.Keys) {
        $deps = ($Results.Dependencies[$key] -join ", ")
        if ($deps) {
            $report04 += "| $key | $deps |`n"
        }
    }
    $report04 | Out-File -FilePath (Join-Path $outputDir "04_DEPENDENCIAS.md") -Encoding UTF8
    Write-Color "  OK 04_DEPENDENCIAS.md" $Green

    # ============================================================
    # RELATORIO 05 - VIOLACOES
    # ============================================================
    $report05 = "# 05 - VIOLACOES ARQUITETURAIS`n# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")`n`n## VIOLACOES ENCONTRADAS`n`n"
    if ($Results.Violations.Count -eq 0) {
        $report05 += "Nenhuma violacao encontrada!`n"
    } else {
        foreach ($v in $Results.Violations) {
            $report05 += "- $v`n"
        }
    }
    $report05 | Out-File -FilePath (Join-Path $outputDir "05_VIOLACOES.md") -Encoding UTF8
    Write-Color "  OK 05_VIOLACOES.md" $Green

    # ============================================================
    # RELATORIO 06 - PLANO DE REFATORACAO
    # ============================================================
    $report06 = @"
# 06 - PLANO DE REFATORACAO ERP
# Gerado em $(Get-Date -Format "dd/MM/yyyy HH:mm")

## OBJETIVO

Transformar o modulo Cozinha em um ERP completo onde a RECEITA e o coracao do sistema.

## FASES

### FASE 1: CORRECAO IMEDIATA

1. Criar fluxo Receita -> Prato
   - Ao salvar Receita, criar Prato automaticamente
   - Prato herda nome, descricao, preco, categoria

2. Criar fluxo Producao -> Estoque
   - Ao finalizar Producao, consumir Estoque
   - Registrar movimentacao de saida

3. Criar fluxo Producao -> Lista de Compras
   - Calcular necessidade de ingredientes
   - Gerar itens pendentes automaticamente

### FASE 2: CONEXOES

4. Conectar Preview -> Catalogo
   - Preview define cardapio do dia
   - Catalogo publico exibe cardapio

5. Conectar Pedidos -> Producao
   - Pedidos geram tarefas de producao
   - Status do pedido atualizado automaticamente

### FASE 3: AUTOMACAO

6. Sistema de Movimentacao
   - Toda entrada/saida de estoque registrada
   - Historico completo

7. Sistema de Custos
   - Custo por receita calculado
   - Margem por prato

## ESTRUTURA FINAL DESEJADA

cozinha-chef/
├── pages/
│   ├── receitas/
│   ├── pratos/
│   ├── estoque/
│   ├── movimentacao/
│   ├── compras/
│   ├── producao/
│   ├── pedidos/
│   ├── financeiro/
│   └── preview/
├── components/
│   ├── receita/
│   ├── prato/
│   ├── estoque/
│   ├── compra/
│   ├── producao/
│   └── pedido/
├── hooks/
│   ├── useReceita.ts
│   ├── usePrato.ts
│   ├── useEstoque.ts
│   ├── useCompra.ts
│   ├── useProducao.ts
│   └── usePedido.ts
├── services/
│   ├── receitaService.ts
│   ├── pratoService.ts
│   ├── estoqueService.ts
│   ├── compraService.ts
│   ├── producaoService.ts
│   └── pedidoService.ts
├── api/
│   └── cozinha/
└── types/
    └── index.ts
"@
    $report06 | Out-File -FilePath (Join-Path $outputDir "06_PLANO_REFATORACAO.md") -Encoding UTF8
    Write-Color "  OK 06_PLANO_REFATORACAO.md" $Green

    Write-Host ""
    Write-Color "  OK 6 relatorios gerados em: $outputDir" $Green
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
$results = Invoke-ERPAudit
$endTime = Get-Date

Generate-ERPReports -Results $results

# ============================================================
# RESUMO FINAL
# ============================================================
Write-Host ""
Write-Color "=====================================================================" $Cyan
Write-Color "  AUDITOR ERP COZINHA CONCLUIDO                                     " $Green
Write-Color "=====================================================================" $Cyan
Write-Host ""
Write-Color "  RESUMO:" $Yellow
Write-Color "  Arquivos analisados: $($results.TotalFiles)" $White
Write-Color "  Paginas:          $($results.TotalPages)" $White
Write-Color "  Componentes:      $($results.TotalComponents)" $White
Write-Color "  Hooks:            $($results.TotalHooks)" $White
Write-Color "  Services:         $($results.TotalServices)" $White
Write-Color "  APIs:             $($results.TotalAPIs)" $White
Write-Color "  Violacoes:        $($results.TotalViolations)" $Red
Write-Color ""
Write-Color "  Relatorios gerados:" $Yellow
Write-Color "     01_MAPA_COMPLETO.md" $White
Write-Color "     02_ROTAS_NAVEGACAO.md" $White
Write-Color "     03_FLUXO_NEGOCIO.md" $White
Write-Color "     04_DEPENDENCIAS.md" $White
Write-Color "     05_VIOLACOES.md" $White
Write-Color "     06_PLANO_REFATORACAO.md" $White
Write-Color ""
Write-Color "  Proxima etapa: Revisar relatorios e iniciar refatoracao" $Yellow
Write-Host ""