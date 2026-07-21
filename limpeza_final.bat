@echo off
echo ==========================================
echo LIMPEZA FINAL - MODULO COZINHA V2.1
echo ==========================================
echo.
echo ATENCAO: Este script removera pastas obsoletas
echo e movera arquivos para a estrutura correta.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause >nul

set BASE=c:\valente_conecta

echo.
echo [1/4] Removendo pastas obsoletas...
echo.

REM ==========================================
REM REMOVER PASTAS QUE NAO EXISTEM MAIS
REM ==========================================
echo    Removendo pratos (fundido com receitas)...
if exist "%BASE%\app\admin-master\cozinha-chef\pratos" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\pratos"

echo    Removendo pedidos (nao e core)...
if exist "%BASE%\app\admin-master\cozinha-chef\pedidos" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\pedidos"

echo    Removendo producao (nao e core)...
if exist "%BASE%\app\admin-master\cozinha-chef\producao" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\producao"

echo    Removendo editar (simplificado)...
if exist "%BASE%\app\admin-master\cozinha-chef\editar" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\editar"

echo    Removendo subpastas de receitas...
if exist "%BASE%\app\admin-master\cozinha-chef\receitas\editar" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\receitas\editar"
if exist "%BASE%\app\admin-master\cozinha-chef\receitas\[id]" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\receitas\[id]"

echo    Removendo ajuste de compras...
if exist "%BASE%\app\admin-master\cozinha-chef\compras\ajuste" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\compras\ajuste"

echo    Removendo components antigos...
if exist "%BASE%\app\admin-master\cozinha-chef\components\CatalogoUI" rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\components\CatalogoUI"

echo OK!

echo.
echo [2/4] Movendo arquivos para posicoes corretas...
echo.

REM ==========================================
REM MOVER MOVIMENTACOES PARA RAIZ
REM ==========================================
echo    Movendo Movimentacoes para raiz...
if exist "%BASE%\app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx" (
    mkdir "%BASE%\app\admin-master\cozinha-chef\movimentacoes" 2>nul
    move "%BASE%\app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx" "%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx"
    rmdir /s /q "%BASE%\app\admin-master\cozinha-chef\estoque\movimentacao"
)

REM ==========================================
REM MOVER COMPONENTES DUPLICADOS
REM ==========================================
echo    Movendo componentes para pasta correta...
if exist "%BASE%\app\admin-master\cozinha-chef\components\*.tsx" (
    move "%BASE%\app\admin-master\cozinha-chef\components\*.tsx" "%BASE%\components\cozinha\" 2>nul
)

echo OK!

echo.
echo [3/4] Criando arquivos que faltam...
echo.

REM ==========================================
REM CRIAR PAGINA DE CARDAPIO PUBLICO
REM ==========================================
echo    Criando pagina de Cardapio Publico...
if not exist "%BASE%\app\cozinha\cardapio\page.tsx" (
    mkdir "%BASE%\app\cozinha\cardapio" 2>nul
    echo "import { useCatalogo } from '@/hooks/cozinha/useCatalogo';" > "%BASE%\app\cozinha\cardapio\page.tsx"
    echo "import { CatalogoUI } from '@/components/cozinha/CatalogoUI';" >> "%BASE%\app\cozinha\cardapio\page.tsx"
    echo "" >> "%BASE%\app\cozinha\cardapio\page.tsx"
    echo "export default function CardapioPublico() {" >> "%BASE%\app\cozinha\cardapio\page.tsx"
    echo "  const { pratos, loading } = useCatalogo();" >> "%BASE%\app\cozinha\cardapio\page.tsx"
    echo "  return <CatalogoUI pratos={pratos} loading={loading} />;" >> "%BASE%\app\cozinha\cardapio\page.tsx"
    echo "}" >> "%BASE%\app\cozinha\cardapio\page.tsx"
    echo    ✅ Cardapio Publico criado!
)

echo OK!

echo.
echo [4/4] Verificando estrutura final...
echo.

REM ==========================================
REM LISTAR ESTRUTURA FINAL
REM ==========================================
echo ESTRUTURA FINAL:
echo.
echo PAGINAS ADMIN:
dir /b "%BASE%\app\admin-master\cozinha-chef\*.tsx" 2>nul
echo.
echo PASTAS ADMIN:
dir /b /ad "%BASE%\app\admin-master\cozinha-chef\" 2>nul
echo.
echo COMPONENTES:
dir /b "%BASE%\components\cozinha\*.tsx" 2>nul
echo.
echo HOOKS:
dir /b "%BASE%\hooks\cozinha\*.ts" 2>nul
echo.
echo SERVICES:
dir /b "%BASE%\services\*.ts" 2>nul

echo.
echo ==========================================
echo LIMPEZA CONCLUIDA!
echo ==========================================
echo.
echo ESTRUTURA FINAL ESPERADA:
echo   app/admin-master/cozinha-chef/
echo     - page.tsx (Dashboard)
echo     - receitas/page.tsx (Lista + Form)
echo     - estoque/page.tsx (Estoque)
echo     - compras/page.tsx (Compras)
echo     - movimentacoes/page.tsx (Movimentacoes)
echo     - financeiro/page.tsx (Financeiro)
echo     - preview/page.tsx (Preview)
echo     - components/ (componentes admin)
echo.
echo   app/cozinha/
echo     - page.tsx (Inicial Publica)
echo     - cardapio/page.tsx (Cardapio Publico)
echo.
echo   components/cozinha/ (componentes reutilizaveis)
echo   hooks/cozinha/ (hooks)
echo   services/ (services)
echo   app/api/cozinha/ (APIs)
echo.
echo PROXIMO PASSO: Executar correcao de imports novamente
echo.
pause