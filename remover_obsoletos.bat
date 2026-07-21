@echo off
echo ==========================================
REMOCAO DE ARQUIVOS OBSOLETOS - MODULO COZINHA
echo ==========================================
echo.
echo ATENCAO: Este script removera arquivos que
echo nao sao mais necessarios no modulo Cozinha.
echo.
echo ARQUIVOS A REMOVER:
echo   - hooks/cozinha/usePratos.ts (fundido com Receitas)
echo   - hooks/cozinha/useProducao.ts (nao e core)
echo   - hooks/cozinha/usePedidos.ts (nao e core)
echo   - services/producaoService.ts (nao e core)
echo   - services/pedidoService.ts (nao e core)
echo   - services/pratosService.ts (fundido com Receitas)
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause >nul

set BASE=c:\valente_conecta

echo.
echo [1/3] Removendo HOOKS obsoletos...
echo.

REM ==========================================
REM REMOVER HOOKS OBSOLETOS
REM ==========================================
if exist "%BASE%\hooks\cozinha\usePratos.ts" (
    del "%BASE%\hooks\cozinha\usePratos.ts"
    echo    ✅ usePratos.ts removido
) else (
    echo    ⚠️ usePratos.ts nao encontrado
)

if exist "%BASE%\hooks\cozinha\useProducao.ts" (
    del "%BASE%\hooks\cozinha\useProducao.ts"
    echo    ✅ useProducao.ts removido
) else (
    echo    ⚠️ useProducao.ts nao encontrado
)

if exist "%BASE%\hooks\cozinha\usePedidos.ts" (
    del "%BASE%\hooks\cozinha\usePedidos.ts"
    echo    ✅ usePedidos.ts removido
) else (
    echo    ⚠️ usePedidos.ts nao encontrado
)

echo.
echo [2/3] Removendo SERVICES obsoletos...
echo.

REM ==========================================
REM REMOVER SERVICES OBSOLETOS
REM ==========================================
if exist "%BASE%\services\producaoService.ts" (
    del "%BASE%\services\producaoService.ts"
    echo    ✅ producaoService.ts removido
) else (
    echo    ⚠️ producaoService.ts nao encontrado
)

if exist "%BASE%\services\pedidoService.ts" (
    del "%BASE%\services\pedidoService.ts"
    echo    ✅ pedidoService.ts removido
) else (
    echo    ⚠️ pedidoService.ts nao encontrado
)

if exist "%BASE%\services\pratosService.ts" (
    del "%BASE%\services\pratosService.ts"
    echo    ✅ pratosService.ts removido
) else (
    echo    ⚠️ pratosService.ts nao encontrado
)

echo.
echo [3/3] Verificando estrutura final...
echo.

REM ==========================================
REM LISTAR ESTRUTURA FINAL
REM ==========================================
echo ==========================================
echo ESTRUTURA FINAL DO MODULO COZINHA
echo ==========================================
echo.
echo HOOKS RESTANTES:
dir /b "%BASE%\hooks\cozinha\*.ts" 2>nul
echo.
echo SERVICES RESTANTES:
dir /b "%BASE%\services\*.ts" 2>nul
echo.
echo PAGINAS ADMIN:
dir /b "%BASE%\app\admin-master\cozinha-chef\*.tsx" 2>nul
echo.
echo PASTAS ADMIN:
dir /b /ad "%BASE%\app\admin-master\cozinha-chef\" 2>nul

echo.
echo ==========================================
echo REMOCAO CONCLUIDA!
echo ==========================================
echo.
echo ARQUIVOS REMOVIDOS:
echo   ✅ usePratos.ts
echo   ✅ useProducao.ts
echo   ✅ usePedidos.ts
echo   ✅ producaoService.ts
echo   ✅ pedidoService.ts
echo   ✅ pratosService.ts
echo.
echo PROXIMO PASSO:
echo   1. Execute 'npm run build' para verificar erros
echo   2. Verifique se tudo esta funcionando
echo.
pause