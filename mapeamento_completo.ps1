# mapeamento_completo.ps1
Write-Host "🔍 FASE 1: MAPEAMENTO COMPLETO DO PROJETO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$projectRoot = "C:\valente_conecta"
$outputDir = "C:\valente_conecta\mapeamento"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# 1. ESTRUTURA COMPLETA DE PASTAS
Write-Host "📁 Gerando árvore completa..." -ForegroundColor Yellow
tree $projectRoot /F > "$outputDir\01_arvore_completa.txt"

# 2. LISTA DE TODOS OS ARQUIVOS
Write-Host "📄 Listando todos os arquivos..." -ForegroundColor Yellow
Get-ChildItem $projectRoot -File -Recurse -ErrorAction SilentlyContinue | 
    Select-Object FullName, Extension, Length, LastWriteTime | 
    Export-Csv "$outputDir\02_todos_arquivos.csv" -NoTypeInformation -Encoding UTF8

# 3. ARQUIVOS POR TIPO
Write-Host "📊 Arquivos por tipo..." -ForegroundColor Yellow
Get-ChildItem $projectRoot -File -Recurse -ErrorAction SilentlyContinue | 
    Group-Object Extension | 
    Select-Object Name, Count | 
    Export-Csv "$outputDir\03_arquivos_por_tipo.csv" -NoTypeInformation -Encoding UTF8

# 4. ROTAS DETECTADAS (Next.js)
Write-Host "🛣️ Mapeando rotas..." -ForegroundColor Yellow
$rotas = @()

# App Router
if (Test-Path "$projectRoot\app") {
    Get-ChildItem "$projectRoot\app" -Directory -Recurse -ErrorAction SilentlyContinue | 
        Where-Object { Test-Path "$($_.FullName)\page.tsx" } | 
        ForEach-Object { 
            $rota = $_.FullName.Replace("$projectRoot\app\", "").Replace("\", "/")
            if ($rota -eq "") { $rota = "/" }
            $rotas += [PSCustomObject]@{ Router = "App"; Rota = "/$rota"; Arquivo = "$($_.FullName)\page.tsx" }
        }
}

# Pages Router
if (Test-Path "$projectRoot\pages") {
    Get-ChildItem "$projectRoot\pages" -File -Recurse -Include "*.tsx","*.jsx" -ErrorAction SilentlyContinue | 
        ForEach-Object {
            $rota = $_.FullName.Replace("$projectRoot\pages\", "").Replace("\", "/").Replace(".tsx", "").Replace(".jsx", "")
            if ($rota -eq "index") { $rota = "/" }
            $rotas += [PSCustomObject]@{ Router = "Pages"; Rota = "/$rota"; Arquivo = $_.FullName }
        }
}

$rotas | Export-Csv "$outputDir\04_rotas.csv" -NoTypeInformation -Encoding UTF8
Write-Host "   Encontradas $($rotas.Count) rotas" -ForegroundColor Green

# 5. MÓDULOS IDENTIFICADOS
Write-Host "📦 Identificando módulos..." -ForegroundColor Yellow
$modulos = @()

# Busca por pastas de módulos em locais comuns
$locaisModulos = @(
    "$projectRoot\app",
    "$projectRoot\app\modules",
    "$projectRoot\modules",
    "$projectRoot\features",
    "$projectRoot\pages\modules"
)

foreach ($local in $locaisModulos) {
    if (Test-Path $local) {
        Get-ChildItem $local -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            $modulo = $_.Name
            $caminho = $_.FullName
            $temPage = (Get-ChildItem $caminho -File -Include "page.tsx","page.jsx" -ErrorAction SilentlyContinue).Count -gt 0
            
            $modulos += [PSCustomObject]@{
                Nome = $modulo
                Caminho = $caminho
                TemPage = $temPage
                Local = $local.Replace("$projectRoot\", "")
            }
        }
    }
}

$modulos | Export-Csv "$outputDir\05_modulos.csv" -NoTypeInformation -Encoding UTF8
Write-Host "   Encontrados $($modulos.Count) módulos" -ForegroundColor Green

# 6. ARQUIVOS COM SUPABASE
Write-Host "🔍 Buscando acesso ao Supabase..." -ForegroundColor Yellow
$supabaseFiles = Select-String -Path "$projectRoot\**\*.ts","$projectRoot\**\*.tsx","$projectRoot\**\*.js","$projectRoot\**\*.jsx" `
    -Pattern "supabase|\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(" `
    -List -ErrorAction SilentlyContinue

$supabaseFiles | Select-Object Path, LineNumber, Line | 
    Export-Csv "$outputDir\06_arquivos_com_supabase.csv" -NoTypeInformation -Encoding UTF8
Write-Host "   Encontrados $($supabaseFiles.Count) arquivos com Supabase" -ForegroundColor Green

# 7. COMPONENTES REUTILIZÁVEIS
Write-Host "🧩 Identificando componentes..." -ForegroundColor Yellow
if (Test-Path "$projectRoot\components") {
    Get-ChildItem "$projectRoot\components" -File -Recurse -Include "*.tsx","*.jsx" -ErrorAction SilentlyContinue |
        Select-Object FullName, Name, Directory |
        Export-Csv "$outputDir\07_componentes.csv" -NoTypeInformation -Encoding UTF8
}

# 8. HOOKS
Write-Host "🪝 Identificando hooks..." -ForegroundColor Yellow
$hooks = Get-ChildItem $projectRoot -File -Recurse -Include "use*.ts","use*.tsx" -ErrorAction SilentlyContinue
$hooks | Select-Object FullName, Name, Directory | 
    Export-Csv "$outputDir\08_hooks.csv" -NoTypeInformation -Encoding UTF8
Write-Host "   Encontrados $($hooks.Count) hooks" -ForegroundColor Green

# 9. SERVICES
Write-Host "⚙️ Identificando services..." -ForegroundColor Yellow
$services = Get-ChildItem $projectRoot -File -Recurse -Include "*Service.ts","*Service.tsx","*service.ts" -ErrorAction SilentlyContinue
$services | Select-Object FullName, Name, Directory | 
    Export-Csv "$outputDir\09_services.csv" -NoTypeInformation -Encoding UTF8

# 10. TYPES
Write-Host "📋 Identificando types..." -ForegroundColor Yellow
$types = Get-ChildItem $projectRoot -File -Recurse -Include "*.types.ts","*.types.tsx","types.ts" -ErrorAction SilentlyContinue
$types | Select-Object FullName, Name, Directory | 
    Export-Csv "$outputDir\10_types.csv" -NoTypeInformation -Encoding UTF8

# 11. ARQUIVOS DUPLICADOS
Write-Host "🔄 Buscando duplicações..." -ForegroundColor Yellow
$todosArquivos = Get-ChildItem $projectRoot -File -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -ErrorAction SilentlyContinue
$duplicados = $todosArquivos | Group-Object Name | Where-Object { $_.Count -gt 1 }
$duplicados | ForEach-Object {
    $nome = $_.Name
    $caminhos = $_.Group | ForEach-Object { $_.FullName }
    [PSCustomObject]@{
        Nome = $nome
        Ocorrencias = $_.Count
        Caminhos = $caminhos -join " | "
    }
} | Export-Csv "$outputDir\11_arquivos_duplicados.csv" -NoTypeInformation -Encoding UTF8
Write-Host "   Encontrados $($duplicados.Count) arquivos duplicados" -ForegroundColor Green

# 12. ARQUIVOS ÓRFÃOS (não importados)
Write-Host "🔎 Buscando arquivos órfãos..." -ForegroundColor Yellow
# Esta é uma análise mais complexa, faremos uma versão simplificada
$todosArquivosTS = Get-ChildItem $projectRoot -File -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue
$orfãos = @()

foreach ($arquivo in $todosArquivosTS) {
    $nome = $arquivo.Name
    $nomeSemExt = [System.IO.Path]::GetFileNameWithoutExtension($nome)
    
    # Procura se o arquivo é importado em algum lugar
    $importado = Select-String -Path "$projectRoot\**\*.ts","$projectRoot\**\*.tsx" -Pattern "import.*$nomeSemExt|from.*['""].*$nomeSemExt" -ErrorAction SilentlyContinue | 
        Where-Object { $_.Path -ne $arquivo.FullName }
    
    if (-not $importado) {
        $orfãos += $arquivo
    }
}

$orfãos | Select-Object FullName, Name, Directory | 
    Export-Csv "$outputDir\12_arquivos_orfãos.csv" -NoTypeInformation -Encoding UTF8
Write-Host "   Encontrados $($orfãos.Count) arquivos órfãos" -ForegroundColor Green

# 13. RELATÓRIO RESUMIDO
Write-Host "`n📊 RELATÓRIO RESUMIDO:" -ForegroundColor Cyan
Write-Host "   Total de arquivos: $( (Get-ChildItem $projectRoot -File -Recurse -ErrorAction SilentlyContinue).Count )" -ForegroundColor White
Write-Host "   Rotas: $($rotas.Count)" -ForegroundColor White
Write-Host "   Módulos: $($modulos.Count)" -ForegroundColor White
Write-Host "   Arquivos com Supabase: $($supabaseFiles.Count)" -ForegroundColor White
Write-Host "   Hooks: $($hooks.Count)" -ForegroundColor White
Write-Host "   Componentes: $((Get-ChildItem $projectRoot\components -File -Recurse -Include "*.tsx","*.jsx" -ErrorAction SilentlyContinue).Count)" -ForegroundColor White
Write-Host "   Arquivos duplicados: $($duplicados.Count)" -ForegroundColor White
Write-Host "   Arquivos órfãos: $($orfãos.Count)" -ForegroundColor White

Write-Host "`n✅ MAPEAMENTO CONCLUÍDO!" -ForegroundColor Green
Write-Host "📁 Resultados salvos em: $outputDir" -ForegroundColor Green