# RADIOGRAFIA_COMPLETA_VALENTE_CONECTA.ps1
# Script completo para análise estrutural do projeto

param(
    [string]$ProjectPath = ".",
    [string]$OutputFile = "RADIOGRAFIA_COMPLETA.md"
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Resolve-Path $ProjectPath
$Output = @()

# Cabeçalho
$Output += "# RADIOGRAFIA COMPLETA - VALENTE CONECTA"
$Output += "**Data da análise:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$Output += "**Caminho do projeto:** $ProjectRoot"
$Output += ""
$Output += "---"
$Output += ""

# ============================================================
# 1. ÁRVORE COMPLETA DE PASTAS E ARQUIVOS
# ============================================================
$Output += "## 1. ARVORE COMPLETA DO PROJETO"
$Output += ""
$Output += "\`\`\`"

# Função para gerar árvore estilo Linux
function Get-TreeView {
    param(
        [string]$Path,
        [string]$Indent = "",
        [bool]$IsLast = $true,
        [int]$MaxDepth = 5,
        [int]$CurrentDepth = 0,
        [string[]]$ExcludeFolders = @("node_modules", ".next", ".git", "dist", "build", ".cache", "__pycache__", ".vscode", ".idea", "coverage", ".nyc_output")
    )
    
    if ($CurrentDepth -ge $MaxDepth) { return }
    
    $items = Get-ChildItem -Path $Path -Force | Where-Object { $ExcludeFolders -notcontains $_.Name } | Sort-Object { $_.PSIsContainer } -Descending
    
    for ($i = 0; $i -lt $items.Count; $i++) {
        $item = $items[$i]
        $isLastItem = ($i -eq $items.Count - 1)
        $prefix = if ($IsLast) { "    " } else { "│   " }
        $connector = if ($isLastItem) { "└── " } else { "├── " }
        
        if ($item.PSIsContainer) {
            $Output += "$Indent$connector$($item.Name)/"
            $newIndent = "$Indent$(if ($isLastItem) { "    " } else { "│   " })"
            Get-TreeView -Path $item.FullName -Indent $newIndent -IsLast $isLastItem -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
        } else {
            $size = if ($item.Length -gt 1MB) { "{0:N2} MB" -f ($item.Length / 1MB) } 
                    elseif ($item.Length -gt 1KB) { "{0:N2} KB" -f ($item.Length / 1KB) }
                    else { "{0} B" -f $item.Length }
            $Output += "$Indent$connector$($item.Name) *($size)*"
        }
    }
}

$Output += "C:\valente_conecta/"
Get-TreeView -Path $ProjectRoot -MaxDepth 4

$Output += "\`\`\`"
$Output += ""

# ============================================================
# 2. LISTA COMPLETA DE ARQUIVOS POR TIPO
# ============================================================
$Output += "## 2. LISTA COMPLETA DE ARQUIVOS"
$Output += ""

# Arquivos TypeScript/TSX
$Output += "### 2.1 Arquivos TypeScript (.ts, .tsx)"
$Output += ""
$tsFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.ts", "*.tsx" -Exclude "*.d.ts" | Where-Object { $_.FullName -notmatch "node_modules|\.next|dist" }
foreach ($file in $tsFiles) {
    $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\")
    $Output += "- $relativePath"
}
$Output += ""
$Output += "**Total:** $($tsFiles.Count) arquivos"
$Output += ""

# Arquivos JavaScript
$Output += "### 2.2 Arquivos JavaScript (.js, .jsx)"
$Output += ""
$jsFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.js", "*.jsx" -Exclude "*.config.js" | Where-Object { $_.FullName -notmatch "node_modules|\.next|dist" }
foreach ($file in $jsFiles) {
    $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\")
    $Output += "- $relativePath"
}
$Output += ""
$Output += "**Total:** $($jsFiles.Count) arquivos"
$Output += ""

# Arquivos CSS/Tailwind
$Output += "### 2.3 Arquivos CSS"
$Output += ""
$cssFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.css", "*.scss", "*.sass" | Where-Object { $_.FullName -notmatch "node_modules|\.next" }
foreach ($file in $cssFiles) {
    $relativePath = $file.FullName.Replace($ProjectRoot, "").TrimStart("\")
    $Output += "- $relativePath"
}
$Output += ""

# Arquivos de Configuração
$Output += "### 2.4 Arquivos de Configuração"
$Output += ""
$configFiles = @(".env*", "*.config.*", "package.json", "tsconfig.json", "tailwind.config.*", "next.config.*", "postcss.config.*")
foreach ($pattern in $configFiles) {
    Get-ChildItem -Path $ProjectRoot -Recurse -Include $pattern -File | Where-Object { $_.FullName -notmatch "node_modules|\.next" } | ForEach-Object {
        $relativePath = $_.FullName.Replace($ProjectRoot, "").TrimStart("\")
        $Output += "- $relativePath"
    }
}
$Output += ""

# ============================================================
# 3. ESTRUTURA DE ROTAS (APP ROUTER)
# ============================================================
$Output += "## 3. ESTRUTURA DE ROTAS (NEXT.JS APP ROUTER)"
$Output += ""

$appPath = Join-Path $ProjectRoot "app"
if (Test-Path $appPath) {
    $Output += "### 3.1 Todas as rotas encontradas"
    $Output += ""
    $rotas = Get-ChildItem -Path $appPath -Recurse -Directory | Where-Object { $_.Name -notmatch "^\(.*\)$" -and $_.Name -notmatch "^_" -and $_.FullName -notmatch "api" }
    
    foreach ($rota in $rotas) {
        $rotaUrl = $rota.FullName.Replace($appPath, "").Replace("\", "/")
        if ([string]::IsNullOrWhiteSpace($rotaUrl)) { $rotaUrl = "/" }
        
        $temPage = Test-Path (Join-Path $rota.FullName "page.tsx")
        $temLayout = Test-Path (Join-Path $rota.FullName "layout.tsx")
        $temLoading = Test-Path (Join-Path $rota.FullName "loading.tsx")
        $temError = Test-Path (Join-Path $rota.FullName "error.tsx")
        
        $status = @()
        if ($temPage) { $status += "page" }
        if ($temLayout) { $status += "layout" }
        if ($temLoading) { $status += "loading" }
        if ($temError) { $status += "error" }
        
        $Output += "- **$rotaUrl** -> [$($status -join ", ")]"
    }
    
    $Output += ""
    $Output += "### 3.2 Rotas da API"
    $Output += ""
    $apiPath = Join-Path $appPath "api"
    if (Test-Path $apiPath) {
        $apiRotas = Get-ChildItem -Path $apiPath -Recurse -Directory
        foreach ($api in $apiRotas) {
            $rotaUrl = $api.FullName.Replace($apiPath, "").Replace("\", "/")
            $temRoute = Test-Path (Join-Path $api.FullName "route.ts")
            if ($temRoute) {
                $Output += "- `/api$rotaUrl`"
            }
        }
    }
}

$Output += ""

# ============================================================
# 4. ADMIN MASTER - MODULOS COMPLETOS
# ============================================================
$Output += "## 4. ADMIN MASTER - ESTRUTURA COMPLETA"
$Output += ""

$adminPath = Join-Path $appPath "admin"
if (Test-Path $adminPath) {
    $Output += "### 4.1 Módulos do Admin Master"
    $Output += ""
    $adminModulos = Get-ChildItem -Path $adminPath -Directory
    foreach ($modulo in $adminModulos) {
        $pagePath = Join-Path $modulo.FullName "page.tsx"
        $exists = Test-Path $pagePath
        $status = if ($exists) { "ATIVO" } else { "INCOMPLETO" }
        $Output += "- **$($modulo.Name)** -> $status"
        
        # Listar arquivos dentro do módulo
        $arquivos = Get-ChildItem -Path $modulo.FullName -File
        foreach ($arquivo in $arquivos) {
            $Output += "    - $($arquivo.Name)"
        }
    }
}

$Output += ""

# ============================================================
# 5. MODULOS PUBLICOS
# ============================================================
$Output += "## 5. MODULOS PUBLICOS"
$Output += ""

$publicModules = @("academia", "comercio", "mototaxi", "servicos", "cozinha", "busca", "planos", "profile", "login", "register")
foreach ($modulo in $publicModules) {
    $moduloPath = Join-Path $appPath $modulo
    if (Test-Path $moduloPath) {
        $pagePath = Join-Path $moduloPath "page.tsx"
        $exists = Test-Path $pagePath
        $status = if ($exists) { "COMPLETO" } else { "SEM PAGE" }
        $Output += "- **$modulo** -> $status"
        
        # Listar subdiretórios
        $subdirs = Get-ChildItem -Path $moduloPath -Directory
        foreach ($subdir in $subdirs) {
            $Output += "    - $($subdir.Name)/"
        }
    } else {
        $Output += "- **$modulo** -> NAO ENCONTRADO"
    }
}

$Output += ""

# ============================================================
# 6. VERIFICACAO DE MODULARIDADE
# ============================================================
$Output += "## 6. ANALISE DE MODULARIDADE"
$Output += ""

# Pastas estruturais
$estruturaPastas = @("components", "hooks", "services", "utils", "lib", "types", "context", "providers", "styles", "public", "middleware")
$Output += "### 6.1 Pastas Estruturais"
$Output += ""
foreach ($pasta in $estruturaPastas) {
    $pastaPath = Join-Path $ProjectRoot $pasta
    if (Test-Path $pastaPath) {
        $count = (Get-ChildItem -Path $pastaPath -Recurse -File -ErrorAction SilentlyContinue).Count
        $Output += "- **$pasta/** -> $count arquivos"
        
        # Listar primeiros 5 arquivos
        $arquivos = Get-ChildItem -Path $pastaPath -File -ErrorAction SilentlyContinue | Select-Object -First 5
        foreach ($arquivo in $arquivos) {
            $Output += "    - $($arquivo.Name)"
        }
        if ($count -gt 5) { $Output += "    - ... e mais $($count - 5) arquivos" }
    } else {
        $Output += "- **$pasta/** -> NAO ENCONTRADA"
    }
}

$Output += ""

# ============================================================
# 7. ANALISE DE DEPENDENCIAS
# ============================================================
$Output += "### 6.2 Dependências do package.json"
$Output += ""

$packagePath = Join-Path $ProjectRoot "package.json"
if (Test-Path $packagePath) {
    try {
        $package = Get-Content $packagePath -Raw | ConvertFrom-Json
        
        $Output += "**Dependências principais:**"
        $Output += ""
        if ($package.dependencies) {
            $package.dependencies.PSObject.Properties | ForEach-Object {
                $Output += "- $($_.Name): $($_.Value)"
            }
        }
        
        $Output += ""
        $Output += "**DevDependencies:**"
        $Output += ""
        if ($package.devDependencies) {
            $package.devDependencies.PSObject.Properties | ForEach-Object {
                $Output += "- $($_.Name): $($_.Value)"
            }
        }
    }
    catch {
        $Output += "Erro ao ler package.json"
    }
}

$Output += ""

# ============================================================
# 8. ANALISE DE FUNCIONALIDADES VS DOCUMENTACAO
# ============================================================
$Output += "## 7. FUNCIONALIDADES VS CODIGO IMPLEMENTADO"
$Output += ""

$funcionalidades = @(
    @{Nome="Busca Inteligente"; Arquivos=@("app/busca/page.tsx")},
    @{Nome="Chat Valentinha IA"; Arquivos=@("components/ValentinhaChat.tsx", "app/admin/ia/page.tsx")},
    @{Nome="Fabrica de Videos"; Arquivos=@("app/admin/videos/page.tsx")},
    @{Nome="PDV Colaborativo"; Arquivos=@("app/comercio/pdv/page.tsx")},
    @{Nome="Moto Taxi"; Arquivos=@("app/mototaxi/page.tsx", "app/admin/mototaxi/page.tsx")},
    @{Nome="Academia"; Arquivos=@("app/academia/page.tsx", "app/admin/academia/page.tsx")},
    @{Nome="Cozinha/Cardapio"; Arquivos=@("app/cozinha/page.tsx", "app/admin/cozinha/page.tsx")},
    @{Nome="Notificacoes"; Arquivos=@("app/admin/notificacoes/page.tsx")},
    @{Nome="QR Code Indicacao"; Arquivos=@("app/qr-code/page.tsx")},
    @{Nome="Planos e Assinaturas"; Arquivos=@("app/planos/page.tsx", "app/admin/planos/page.tsx")}
)

foreach ($func in $funcionalidades) {
    $encontrados = @()
    foreach ($arquivo in $func.Arquivos) {
        $pathCompleto = Join-Path $ProjectRoot $arquivo
        if (Test-Path $pathCompleto) {
            $encontrados += $arquivo
        }
    }
    
    if ($encontrados.Count -gt 0) {
        $Output += "- **$($func.Nome)**: IMPLEMENTADO ($($encontrados -join ", "))"
    } else {
        $Output += "- **$($func.Nome)**: NAO IMPLEMENTADO"
    }
}

$Output += ""

# ============================================================
# 9. VERIFICACAO DE ERROS COMUNS
# ============================================================
$Output += "## 8. VERIFICACAO DE PROBLEMAS COMUNS"
$Output += ""

$Output += "### 8.1 Arquivos com 'location is not defined' (possível erro SSR)"
$Output += ""
$arquivosComLocation = Select-String -Path "$ProjectRoot\app\**\*.tsx" -Pattern "location\." -ErrorAction SilentlyContinue | ForEach-Object { $_.Filename } | Select-Object -Unique
foreach ($arquivo in $arquivosComLocation) {
    $relativePath = $arquivo.Replace($ProjectRoot, "").TrimStart("\")
    $Output += "- $relativePath"
}
if ($arquivosComLocation.Count -eq 0) { $Output += "- Nenhum arquivo encontrado com 'location.'" }

$Output += ""

$Output += "### 8.2 Arquivos com 'localStorage' (pode causar erro SSR)"
$Output += ""
$arquivosComStorage = Select-String -Path "$ProjectRoot\app\**\*.tsx" -Pattern "localStorage|sessionStorage" -ErrorAction SilentlyContinue | ForEach-Object { $_.Filename } | Select-Object -Unique
foreach ($arquivo in $arquivosComStorage) {
    $relativePath = $arquivo.Replace($ProjectRoot, "").TrimStart("\")
    $Output += "- $relativePath"
}

$Output += ""

$Output += "### 8.3 Arquivos sem 'use client' (mas usando hooks ou browser APIs)"
$Output += ""
$arquivosSemUseClient = Select-String -Path "$ProjectRoot\app\**\*.tsx" -Pattern "useState|useEffect|useRouter" -ErrorAction SilentlyContinue | Where-Object { 
    $linha = $_.Line
    $arquivo = $_.Filename
    $conteudo = Get-Content $arquivo -Raw
    $conteudo -notmatch '"use client"|"use client";'
} | ForEach-Object { $_.Filename } | Select-Object -Unique

foreach ($arquivo in $arquivosSemUseClient) {
    $relativePath = $arquivo.Replace($ProjectRoot, "").TrimStart("\")
    $Output += "- $relativePath"
}

$Output += ""

# ============================================================
# 10. ESTATISTICAS GERAIS
# ============================================================
$Output += "## 9. ESTATISTICAS GERAIS"
$Output += ""

$totalArquivos = (Get-ChildItem -Path $ProjectRoot -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules|\.next|dist" }).Count
$totalPastas = (Get-ChildItem -Path $ProjectRoot -Recurse -Directory | Where-Object { $_.FullName -notmatch "node_modules|\.next|dist" }).Count
$totalLinhas = (Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx", "*.css" | Where-Object { $_.FullName -notmatch "node_modules|\.next" } | Get-Content | Measure-Object -Line).Lines

$Output += "| Metrica | Valor |"
$Output += "|---------|-------|"
$Output += "| Total de Arquivos | $totalArquivos |"
$Output += "| Total de Pastas | $totalPastas |"
$Output += "| Total de Linhas de Codigo | $totalLinhas |"
$Output += "| Arquivos TypeScript/TSX | $($tsFiles.Count) |"
$Output += "| Modulos do Admin Master | $($adminModulos.Count) |"
$Output += "| Rotas Publicas | $($rotas.Count) |"

$Output += ""

# ============================================================
# 11. AVALIACAO FINAL
# ============================================================
$Output += "## 10. AVALIACAO FINAL"
$Output += ""

$pontosPositivos = 0
$totalPontos = 10

if (Test-Path $appPath) { $pontosPositivos++ }
if ($adminModulos.Count -gt 5) { $pontosPositivos++ }
if (Test-Path (Join-Path $ProjectRoot "components")) { $pontosPositivos++ }
if (Test-Path (Join-Path $ProjectRoot "hooks")) { $pontosPositivos++ }
if (Test-Path (Join-Path $ProjectRoot "services")) { $pontosPositivos++ }
if (Test-Path (Join-Path $ProjectRoot "types")) { $pontosPositivos++ }
if (Test-Path (Join-Path $ProjectRoot "context")) { $pontosPositivos++ }
if ($publicModules.Count -gt 0) { $pontosPositivos++ }
if ($arquivosComLocation.Count -eq 0) { $pontosPositivos++ }
if ($totalArquivos -gt 50) { $pontosPositivos++ }

$percentual = [math]::Round(($pontosPositivos / $totalPontos) * 100)

$Output += "**Pontuacao de Qualidade Estrutural:** $pontosPositivos / $totalPontos ($percentual%)"
$Output += ""

if ($percentual -ge 80) {
    $Output += "### ✅ PARABENS! O projeto tem excelente estrutura modular!"
} elseif ($percentual -ge 60) {
    $Output += "### ⚠️ BOA BASE, mas precisa de melhorias na modularidade"
} elseif ($percentual -ge 40) {
    $Output += "### ⚠️ ESTRUTURA MEDIANA - Alto risco de acoplamento"
} else {
    $Output += "### ❌ ESTRUTURA FRACA - Necessita refatoracao urgente"
}

$Output += ""
$Output += "**Recomendacoes:**"
$Output += ""

if (-not (Test-Path (Join-Path $ProjectRoot "components"))) {
    $Output += "1. Criar pasta `/components` para componentes reutilizaveis"
}
if (-not (Test-Path (Join-Path $ProjectRoot "hooks"))) {
    $Output += "2. Criar pasta `/hooks` para hooks personalizados"
}
if (-not (Test-Path (Join-Path $ProjectRoot "services"))) {
    $Output += "3. Criar pasta `/services` para API e logica de negocios"
}
if ($arquivosComLocation.Count -gt 0) {
    $Output += "4. Corrigir arquivos com 'location' (adicionar 'use client' ou usar useEffect)"
}
if ($arquivosSemUseClient.Count -gt 0) {
    $Output += "5. Adicionar 'use client' nos componentes que usam hooks React"
}

$Output += ""
$Output += "---"
$Output += "*Radiografia gerada automaticamente em $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')*"

# ============================================================
# GERAR ARQUIVO
# ============================================================
$OutputPath = Join-Path $ProjectRoot $OutputFile
$Output -join "`r`n" | Out-File -FilePath $OutputPath -Encoding utf8

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "✅ RADIOGRAFIA COMPLETA CONCLUÍDA!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "📄 Arquivo gerado: $OutputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 RESUMO:" -ForegroundColor Magenta
Write-Host "   • Total de arquivos: $totalArquivos" -ForegroundColor White
Write-Host "   • Total de pastas: $totalPastas" -ForegroundColor White
Write-Host "   • Linhas de código: $totalLinhas" -ForegroundColor White
Write-Host "   • Módulos Admin: $($adminModulos.Count)" -ForegroundColor White
Write-Host "   • Rotas públicas: $($rotas.Count)" -ForegroundColor White
Write-Host "   • Qualidade estrutural: $pontosPositivos/$totalPontos ($percentual%)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 ABRA O ARQUIVO PARA VER A ÁRVORE COMPLETA DO PROJETO!" -ForegroundColor Cyan
Write-Host ""