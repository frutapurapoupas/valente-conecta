#!/usr/bin/env pwsh
# ============================================================
# AUDITOR_ARQUITETURA_GERAL.ps1
# Auditoria Arquitetural - Valente Conecta
# Foco: Home Admin Master e Home Principal
# ============================================================

param([switch]$Help)

if ($Help) {
    Write-Host "Uso: .\AUDITOR_ARQUITETURA_GERAL.ps1`n"
    exit 0
}

$projectRoot = "C:\valente_conecta"
$outputDir = "$projectRoot\auditoria_arquitetura_geral"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$reportFile = "$outputDir\RELATORIO_ARQUITETURA_$timestamp.txt"

New-Item -Path $outputDir -ItemType Directory -Force | Out-Null

# ============================================================
# FUNCAO: RELATORIO
# ============================================================
function Report {
    param([string]$msg, [string]$color = "White")
    Write-Host $msg -ForegroundColor $color
    Add-Content -Path $reportFile -Value $msg
}

# ============================================================
# CABECALHO
# ============================================================
Clear-Host
Report "=================================================================================" "Cyan"
Report "  AUDITOR DE ARQUITETURA - VALENTE CONECTA" "Cyan"
Report "  Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" "Gray"
Report "=================================================================================" "Cyan"
Report ""

# ============================================================
# 1. VERIFICAR ARQUIVOS CRITICOS
# ============================================================
Report "[1] VERIFICANDO ARQUIVOS CRITICOS" "Yellow"
Report "--------" "Gray"

$criticos = @{
    "Home Admin Master" = "app/admin-master/page.tsx"
    "Home Principal" = "app/page.tsx"
    "App Context" = "app/context/AppContext.tsx"
    "Layout Principal" = "app/layout.tsx"
}

$problemasArquivos = @()
foreach ($nome in $criticos.Keys) {
    $arquivo = $criticos[$nome]
    $path = "$projectRoot\$arquivo"
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        Report "  OK - $nome - EXISTS ($size bytes)" "Green"
    } else {
        Report "  ERRO - $nome - MISSING: $arquivo" "Red"
        $problemasArquivos += $nome
    }
}
Report ""

# ============================================================
# 2. ANALISAR HOME ADMIN MASTER
# ============================================================
Report "[2] ANALISANDO HOME ADMIN MASTER" "Yellow"
Report "--------" "Gray"

$homeAdminPath = "$projectRoot\app\admin-master\page.tsx"
if (Test-Path $homeAdminPath) {
    $content = Get-Content $homeAdminPath -Raw
    
    # Procurar por problemas comuns
    $problemas = @()
    
    if ($content -match 'overflow-.*hidden|max-h-.*\b(screen|96|full)') {
        $problemas += "AVISO - Possivel overflow truncado detectado"
    }
    
    if ($content -match 'grid|flex' -and -not ($content -match 'responsive|gap|p-|m-')) {
        $problemas += "AVISO - Grid/Flex sem spacing visivel"
    }
    
    if ($content -match '<div[^>]*>[\s\S]*?</div>' -and ($content | Measure-Object -Character).Characters -gt 2000) {
        Report "  Tamanho do arquivo: $($content.Length) caracteres" "White"
        Report "  Complexidade: ALTA" "Yellow"
    }
    
    if ($problemas.Count -gt 0) {
        foreach ($p in $problemas) {
            Report "  AVISO - $p" "Red"
        }
    } else {
        Report "  OK - Nenhuma flag visivel de layout truncado" "Green"
    }
    
    # Verificar imports
    $imports = [regex]::Matches($content, 'import.*from|require')
    Report "  Imports encontrados: $($imports.Count)" "White"
    
} else {
    Report "  ERRO - Arquivo nao encontrado!" "Red"
}
Report ""

# ============================================================
# 3. ANALISAR HOME PRINCIPAL
# ============================================================
Report "[3] ANALISANDO HOME PRINCIPAL" "Yellow"
Report "--------" "Gray"

$homeMainPath = "$projectRoot\app\page.tsx"
if (Test-Path $homeMainPath) {
    $content = Get-Content $homeMainPath -Raw
    
    Report "  Tamanho: $($content.Length) caracteres" "White"
    
    # Verificar se tem fetch/API calls
    if ($content -match 'fetch\(|\.get\(|\.post\(|axios') {
        Report "  ERRO - VIOLACAO - Fetch/API calls detectados em componente" "Red"
    } else {
        Report "  OK - Sem fetch/API calls diretos" "Green"
    }
    
    # Verificar hooks
    $hooks = [regex]::Matches($content, 'use[A-Z]\w+')
    Report "  Hooks encontrados: $($hooks.Count)" "White"
    
    # Verificar contexto
    if ($content -match 'useContext|AppContext') {
        Report "  OK - Usando Context corretamente" "Green"
    } else {
        Report "  AVISO - Nao usa AppContext" "Yellow"
    }
    
    # Verificar async/await
    if ($content -match 'async\s+(function|=>)|await\s+') {
        Report "  ERRO - VIOLACAO - Async/await em componente" "Red"
    } else {
        Report "  OK - Sem async/await" "Green"
    }
    
} else {
    Report "  ERRO - Arquivo nao encontrado!" "Red"
}
Report ""

# ============================================================
# 4. VERIFICAR SEPARACAO ARQUITETURAL
# ============================================================
Report "[4] VERIFICANDO SEPARACAO ARQUITETURAL" "Yellow"
Report "--------" "Gray"

$estrutura = @{
    "Components" = "components"
    "Hooks" = "hooks"
    "Services" = "services"
    "Types" = "types"
    "APIs" = "app/api"
}

foreach ($tipo in $estrutura.Keys) {
    $pasta = $estrutura[$tipo]
    $path = "$projectRoot\$pasta"
    
    if (Test-Path $path) {
        $count = (Get-ChildItem -Path $path -Recurse -File -Include "*.ts", "*.tsx", "*.js", "*.jsx" -ErrorAction SilentlyContinue | Measure-Object).Count
        Report "  OK - $tipo : $count arquivos" "Green"
    } else {
        Report "  ERRO - $tipo : PASTA NAO ENCONTRADA ($pasta)" "Red"
    }
}
Report ""

# ============================================================
# 5. BUSCAR VIOLACOES COMUNS
# ============================================================
Report "[5] BUSCANDO VIOLACOES DE ARQUITETURA" "Yellow"
Report "--------" "Gray"

$violacoes = @()

# Procurar fetch em componentes TSX
$componentes = Get-ChildItem -Path "$projectRoot\components" -Recurse -Include "*.tsx" -ErrorAction SilentlyContinue
foreach ($comp in $componentes) {
    $content = Get-Content $comp.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match 'fetch\(|axios\.|fetch.*from.*api|\.get\(.*api') {
        $violacoes += "fetch em: $($comp.Name)"
    }
}

# Procurar DB access em pages/components
$pages = Get-ChildItem -Path "$projectRoot\app" -Recurse -Include "page.tsx" -ErrorAction SilentlyContinue | Select-Object -First 10
foreach ($page in $pages) {
    $content = Get-Content $page.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match 'Supabase|\.from\(|query\(|db\.' -and -not ($content -match 'async.*getServerSideProps|async.*getStaticProps')) {
        $violacoes += "DB em: $($page.Name)"
    }
}

if ($violacoes.Count -gt 0) {
    Report "  AVISO - Violacoes encontradas: $($violacoes.Count)" "Red"
    foreach ($v in $violacoes) {
        Report "    - $v" "Red"
    }
} else {
    Report "  OK - Nenhuma violacao critica detectada" "Green"
}
Report ""

# ============================================================
# 6. ANALISE DE DEPENDENCIAS
# ============================================================
Report "[6] ANALISE DE DEPENDENCIAS" "Yellow"
Report "--------" "Gray"

$packagePath = "$projectRoot\package.json"
if (Test-Path $packagePath) {
    $package = Get-Content $packagePath | ConvertFrom-Json
    Report "  Dependencias: $($package.dependencies.PSObject.Properties.Count)" "White"
    Report "  DevDependencias: $($package.devDependencies.PSObject.Properties.Count)" "White"
} else {
    Report "  ERRO - package.json nao encontrado" "Red"
}
Report ""

# ============================================================
# RESUMO
# ============================================================
Report "=================================================================================" "Cyan"
Report "  RESUMO" "Cyan"
Report "=================================================================================" "Cyan"
Report "Problemas de Arquivo: $($problemasArquivos.Count)" "White"
Report "Violacoes de Arquitetura: $($violacoes.Count)" "White"
Report ""
Report "Relatorio salvo em: $reportFile" "Green"
Report ""
Report "Proximo passo: Analisar relatorio e investigar raizes" "Yellow"
