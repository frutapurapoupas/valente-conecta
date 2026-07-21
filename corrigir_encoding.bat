@echo off
echo ==========================================
CORRECAO DE ENCODING - UTF-8
==========================================
echo.
echo ATENCAO: Este script convertara arquivos
echo com encoding incorreto para UTF-8.
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

set BASE=c:\valente_conecta

echo.
echo [1/3] Corrigindo arquivos do modulo Cozinha...
echo.

REM ==========================================
REM CORRIGIR ARQUIVOS DO COZINHA
REM ==========================================
if exist "%BASE%\app\admin-master\cozinha-chef\hooks\useFinanceiro.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\hooks\useFinanceiro.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\hooks\useFinanceiro.ts', $utf8) }"
    echo    ✅ useFinanceiro.ts corrigido
)

if exist "%BASE%\app\admin-master\cozinha-chef\hooks\useFinanceiroPessoal.ts" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\hooks\useFinanceiroPessoal.ts' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\app\admin-master\cozinha-chef\hooks\useFinanceiroPessoal.ts', $utf8) }"
    echo    ✅ useFinanceiroPessoal.ts corrigido
)

echo.
echo [2/3] Corrigindo arquivos do modulo Academia...
echo.

REM ==========================================
REM CORRIGIR ARQUIVOS DA ACADEMIA
REM ==========================================
if exist "%BASE%\components\academia\LocalizadorAcademia.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\components\academia\LocalizadorAcademia.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\components\academia\LocalizadorAcademia.tsx', $utf8) }"
    echo    ✅ LocalizadorAcademia.tsx corrigido
)

echo.
echo [3/3] Corrigindo arquivos do modulo Financeiro...
echo.

REM ==========================================
REM CORRIGIR ARQUIVOS DO FINANCEIRO
REM ==========================================
if exist "%BASE%\components\financeiro\ModalCategoria.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\components\financeiro\ModalCategoria.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\components\financeiro\ModalCategoria.tsx', $utf8) }"
    echo    ✅ ModalCategoria.tsx corrigido
)

if exist "%BASE%\components\financeiro\ModalTransacao.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\components\financeiro\ModalTransacao.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\components\financeiro\ModalTransacao.tsx', $utf8) }"
    echo    ✅ ModalTransacao.tsx corrigido
)

if exist "%BASE%\components\financeiro\TabelaTransacoes.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\components\financeiro\TabelaTransacoes.tsx' -Raw -ErrorAction SilentlyContinue; if ($content) { $utf8 = [System.Text.Encoding]::UTF8.GetBytes($content); [System.IO.File]::WriteAllBytes('%BASE%\components\financeiro\TabelaTransacoes.tsx', $utf8) }"
    echo    ✅ TabelaTransacoes.tsx corrigido
)

echo.
echo ==========================================
echo CORRECAO CONCLUIDA!
echo ==========================================
echo.
echo PROXIMO PASSO:
echo   1. Execute 'npm run build' novamente
echo   2. Verifique se os erros foram resolvidos
echo.
pause