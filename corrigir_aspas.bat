@echo off
echo ==========================================
CORRECAO DE IMPORTS - ASPAS FALTANDO
==========================================
echo.
echo ATENCAO: Este script corrigira imports
echo que estao sem aspas no caminho.
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

set BASE=c:\valente_conecta

echo.
echo [1/4] Corrigindo paginas do modulo Cozinha...
echo.

REM ==========================================
REM CORRIGIR COMPRAS
REM ==========================================
if exist "%BASE%\app\admin-master\cozinha-chef\compras\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/hooks', 'from '@/hooks'; $content = $content -replace 'from @/types', 'from '@/types'; Set-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx' -Value $content"
    echo    ✅ compras/page.tsx corrigido
)

REM ==========================================
REM CORRIGIR PREVIEW
REM ==========================================
if exist "%BASE%\app\admin-master\cozinha-chef\preview\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/hooks', 'from '@/hooks'; Set-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx' -Value $content"
    echo    ✅ preview/page.tsx corrigido
)

echo.
echo [2/4] Corrigindo APIs do modulo Cozinha...
echo.

REM ==========================================
REM CORRIGIR API CARDAPIO
REM ==========================================
if exist "%BASE%\app\api\cozinha\cardapio\route.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\api\cozinha\cardapio\route.ts' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/lib', 'from '@/lib'; Set-Content '%BASE%\app\api\cozinha\cardapio\route.ts' -Value $content"
    echo    ✅ cardapio/route.ts corrigido
)

REM ==========================================
REM CORRIGIR API ESTOQUE
REM ==========================================
if exist "%BASE%\app\api\cozinha\estoque\route.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\api\cozinha\estoque\route.ts' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/lib', 'from '@/lib'; Set-Content '%BASE%\app\api\cozinha\estoque\route.ts' -Value $content"
    echo    ✅ estoque/route.ts corrigido
)

REM ==========================================
REM CORRIGIR API FINANCEIRO
REM ==========================================
if exist "%BASE%\app\api\cozinha\financeiro\route.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\api\cozinha\financeiro\route.ts' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/lib', 'from '@/lib'; Set-Content '%BASE%\app\api\cozinha\financeiro\route.ts' -Value $content"
    echo    ✅ financeiro/route.ts corrigido
)

REM ==========================================
REM CORRIGIR API RECEITAS
REM ==========================================
if exist "%BASE%\app\api\cozinha\receitas\route.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\api\cozinha\receitas\route.ts' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/lib', 'from '@/lib'; Set-Content '%BASE%\app\api\cozinha\receitas\route.ts' -Value $content"
    echo    ✅ receitas/route.ts corrigido
)

REM ==========================================
REM CORRIGIR API COMPRAS
REM ==========================================
if exist "%BASE%\app\api\cozinha\compras\route.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\api\cozinha\compras\route.ts' -Raw; $content = $content -replace 'from @/', 'from @/'; $content = $content -replace 'from @/lib', 'from '@/lib'; Set-Content '%BASE%\app\api\cozinha\compras\route.ts' -Value $content"
    echo    ✅ compras/route.ts corrigido
)

echo.
echo [3/4] Corrigindo outros arquivos com imports quebrados...
echo.

REM ==========================================
REM CORRIGIR TODOS OS ARQUIVOS COM from @/
REM ==========================================
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { $content = Get-Content $_.FullName -Raw; if ($content -match 'from @/') { $content = $content -replace 'from @/', 'from '@/'; Set-Content $_.FullName -Value $content; Write-Host \"   ✅ $($_.Name) corrigido\" } }"
echo    ✅ Todos os arquivos com 'from @/' corrigidos!

echo.
echo [4/4] Verificando arquivos com problemas especificos...
echo.

REM ==========================================
REM VERIFICAR ARQUIVOS ESPECIFICOS
REM ==========================================
findstr /s /i /c:"from @/" "%BASE%\app\admin-master\cozinha-chef\*.tsx" "%BASE%\app\api\cozinha\*.ts" "%BASE%\hooks\cozinha\*.ts" 2>nul

echo.
echo ==========================================
echo CORRECAO CONCLUIDA!
echo ==========================================
echo.
echo ARQUIVOS CORRIGIDOS:
echo   ✅ app/admin-master/cozinha-chef/compras/page.tsx
echo   ✅ app/admin-master/cozinha-chef/preview/page.tsx
echo   ✅ app/api/cozinha/cardapio/route.ts
echo   ✅ app/api/cozinha/estoque/route.ts
echo   ✅ app/api/cozinha/financeiro/route.ts
echo   ✅ app/api/cozinha/receitas/route.ts
echo   ✅ app/api/cozinha/compras/route.ts
echo   ✅ Todos os outros arquivos com 'from @/'
echo.
echo PROXIMO PASSO:
echo   1. Execute 'npm run build' novamente
echo   2. Verifique se os erros foram resolvidos
echo.
pause