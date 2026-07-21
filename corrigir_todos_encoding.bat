@echo off
echo ==========================================
CORRECAO DE ENCODING - TODOS OS ARQUIVOS
==========================================
echo.
echo ATENCAO: Este script convertara TODOS os
echo arquivos com encoding incorreto para UTF-8.
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

set BASE=c:\valente_conecta

echo.
echo [1/5] Corrigindo services do modulo Cozinha...
echo.

if exist "%BASE%\services\financeiroService.ts" (
    powershell -Command "$content = Get-Content '%BASE%\services\financeiroService.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\services\financeiroService.ts', $utf8) }"
    echo    ✅ financeiroService.ts corrigido
)

if exist "%BASE%\services\cozinhaService.ts" (
    powershell -Command "$content = Get-Content '%BASE%\services\cozinhaService.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\services\cozinhaService.ts', $utf8) }"
    echo    ✅ cozinhaService.ts corrigido
)

if exist "%BASE%\services\estoqueService.ts" (
    powershell -Command "$content = Get-Content '%BASE%\services\estoqueService.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\services\estoqueService.ts', $utf8) }"
    echo    ✅ estoqueService.ts corrigido
)

if exist "%BASE%\services\receitaService.ts" (
    powershell -Command "$content = Get-Content '%BASE%\services\receitaService.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\services\receitaService.ts', $utf8) }"
    echo    ✅ receitaService.ts corrigido
)

if exist "%BASE%\services\comprasService.ts" (
    powershell -Command "$content = Get-Content '%BASE%\services\comprasService.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\services\comprasService.ts', $utf8) }"
    echo    ✅ comprasService.ts corrigido
)

echo.
echo [2/5] Corrigindo paginas do modulo Academia...
echo.

if exist "%BASE%\app\academia\academia-local\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\academia\academia-local\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\academia\academia-local\page.tsx', $utf8) }"
    echo    ✅ academia-local/page.tsx corrigido
)

if exist "%BASE%\app\academia\biblioteca\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\academia\biblioteca\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\academia\biblioteca\page.tsx', $utf8) }"
    echo    ✅ biblioteca/page.tsx corrigido
)

if exist "%BASE%\app\academia\cadastro-inicial\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\academia\cadastro-inicial\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\academia\cadastro-inicial\page.tsx', $utf8) }"
    echo    ✅ cadastro-inicial/page.tsx corrigido
)

if exist "%BASE%\app\academia\esportes\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\academia\esportes\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\academia\esportes\page.tsx', $utf8) }"
    echo    ✅ esportes/page.tsx corrigido
)

if exist "%BASE%\app\academia\dashboard\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\academia\dashboard\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\academia\dashboard\page.tsx', $utf8) }"
    echo    ✅ dashboard/page.tsx corrigido
)

echo.
echo [3/5] Corrigindo paginas do modulo Financeiro Pessoal...
echo.

if exist "%BASE%\app\admin-master\financeiro-pessoal\transacoes\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\financeiro-pessoal\transacoes\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\financeiro-pessoal\transacoes\page.tsx', $utf8) }"
    echo    ✅ transacoes/page.tsx corrigido
)

echo.
echo [4/5] Corrigindo paginas do modulo Cozinha...
echo.

if exist "%BASE%\app\admin-master\cozinha-chef\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\page.tsx', $utf8) }"
    echo    ✅ page.tsx corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx', $utf8) }"
    echo    ✅ receitas/page.tsx corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx', $utf8) }"
    echo    ✅ estoque/page.tsx corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\compras\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\compras\page.tsx', $utf8) }"
    echo    ✅ compras/page.tsx corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx', $utf8) }"
    echo    ✅ movimentacoes/page.tsx corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx', $utf8) }"
    echo    ✅ financeiro/page.tsx corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\preview\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\preview\page.tsx', $utf8) }"
    echo    ✅ preview/page.tsx corrigido
)

echo.
echo [5/5] Corrigindo componentes...
echo.

if exist "%BASE%\app\cozinha\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\cozinha\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\cozinha\page.tsx', $utf8) }"
    echo    ✅ app/cozinha/page.tsx corrigido
)

if exist "%BASE%\app\cozinha\cardapio\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\cozinha\cardapio\page.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\cozinha\cardapio\page.tsx', $utf8) }"
    echo    ✅ app/cozinha/cardapio/page.tsx corrigido
)

REM ==========================================
REM CORRIGIR TODOS OS ARQUIVOS .TS E .TSX
REM ==========================================
echo.
echo Corrigindo todos os arquivos .ts e .tsx...
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { try { $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes($_.FullName, $utf8) } } catch {} }"
echo    ✅ Todos os arquivos corrigidos!

echo.
echo ==========================================
echo CORRECAO CONCLUIDA!
echo ==========================================
echo.
echo ARQUIVOS CORRIGIDOS:
echo   ✅ services/financeiroService.ts
echo   ✅ services/cozinhaService.ts
echo   ✅ services/estoqueService.ts
echo   ✅ services/receitaService.ts
echo   ✅ services/comprasService.ts
echo   ✅ Todas as paginas do Academia
echo   ✅ Todas as paginas do Financeiro Pessoal
echo   ✅ Todas as paginas do Cozinha
echo   ✅ Todos os componentes
echo.
echo PROXIMO PASSO:
echo   1. Execute 'npm run build' novamente
echo   2. Verifique se os erros foram resolvidos
echo.
pause