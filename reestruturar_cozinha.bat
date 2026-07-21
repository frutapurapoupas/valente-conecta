@echo off
echo ==========================================
echo REESTRUTURACAO MODULO COZINHA - V2.1
echo ==========================================
echo.

REM ==========================================
REM PASSO 1: RENOMEAR RAIZ
REM ==========================================
echo [1/5] Renomeando raiz para c:\valente_conecta1...
if exist "c:\valente_conecta" (
    echo Renomeando c:\valente_conecta para c:\valente_conecta1...
    ren "c:\valente_conecta" "valente_conecta1"
)
echo OK!

REM ==========================================
REM PASSO 2: CRIAR NOVA ESTRUTURA
REM ==========================================
echo [2/5] Criando nova estrutura de pastas...
set BASE=c:\valente_conecta

mkdir "%BASE%" 2>nul
mkdir "%BASE%\app\admin-master\cozinha-chef" 2>nul
mkdir "%BASE%\app\cozinha\cardapio" 2>nul
mkdir "%BASE%\components\cozinha" 2>nul
mkdir "%BASE%\hooks\cozinha" 2>nul
mkdir "%BASE%\services" 2>nul
mkdir "%BASE%\app\api\cozinha\receitas" 2>nul
mkdir "%BASE%\app\api\cozinha\estoque" 2>nul
mkdir "%BASE%\app\api\cozinha\compras" 2>nul
mkdir "%BASE%\app\api\cozinha\cardapio" 2>nul
mkdir "%BASE%\types" 2>nul
mkdir "%BASE%\utils" 2>nul
echo OK!

REM ==========================================
REM PASSO 3: MOVER ARQUIVOS (ORIGEM -> DESTINO)
REM ==========================================
echo [3/5] Movendo arquivos para nova estrutura...
set ORIGEM=c:\valente_conecta1

REM 3.1 - PÁGINAS ADMIN
echo    Movendo paginas admin...
move "%ORIGEM%\app\admin-master\cozinha-chef\page.tsx" "%BASE%\app\admin-master\cozinha-chef\page.tsx" 2>nul

REM 3.2 - PÁGINA RECEITAS (SIMPLIFICADA)
echo    Movendo pagina de receitas...
move "%ORIGEM%\app\admin-master\cozinha-chef\receitas\page.tsx" "%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx" 2>nul

REM 3.3 - PÁGINA ESTOQUE
echo    Movendo pagina de estoque...
move "%ORIGEM%\app\admin-master\cozinha-chef\estoque\page.tsx" "%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx" 2>nul

REM 3.4 - PÁGINA COMPRAS
echo    Movendo pagina de compras...
move "%ORIGEM%\app\admin-master\cozinha-chef\compras\page.tsx" "%BASE%\app\admin-master\cozinha-chef\compras\page.tsx" 2>nul

REM 3.5 - PÁGINA MOVIMENTACOES
echo    Movendo pagina de movimentacoes...
move "%ORIGEM%\app\admin-master\cozinha-chef\estoque\movimentacao\page.tsx" "%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx" 2>nul

REM 3.6 - PÁGINA FINANCEIRO
echo    Movendo pagina de financeiro...
move "%ORIGEM%\app\admin-master\cozinha-chef\financeiro\page.tsx" "%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx" 2>nul

REM 3.7 - PÁGINA PREVIEW
echo    Movendo pagina de preview...
move "%ORIGEM%\app\admin-master\cozinha-chef\preview\page.tsx" "%BASE%\app\admin-master\cozinha-chef\preview\page.tsx" 2>nul

REM 3.8 - PÁGINA CARDAPIO PUBLICO
echo    Movendo pagina de cardapio publico...
move "%ORIGEM%\app\cozinha\catalogo\page.tsx" "%BASE%\app\cozinha\cardapio\page.tsx" 2>nul

REM 3.9 - PÁGINA INICIAL PUBLICO
echo    Movendo pagina inicial publica...
move "%ORIGEM%\app\cozinha\page.tsx" "%BASE%\app\cozinha\page.tsx" 2>nul

REM 3.10 - COMPONENTES REUTILIZAVEIS
echo    Movendo componentes reutilizaveis...
move "%ORIGEM%\components\cozinha\CatalogoUI.tsx" "%BASE%\components\cozinha\CatalogoUI.tsx" 2>nul
move "%ORIGEM%\components\cozinha\DashboardUI.tsx" "%BASE%\components\cozinha\DashboardUI.tsx" 2>nul
move "%ORIGEM%\components\cozinha\ReceitaForm.tsx" "%BASE%\components\cozinha\ReceitaForm.tsx" 2>nul
move "%ORIGEM%\components\cozinha\SelecaoPerfilUI.tsx" "%BASE%\components\cozinha\SelecaoPerfilUI.tsx" 2>nul
move "%ORIGEM%\components\cozinha\ModalAssinatura.tsx" "%BASE%\components\cozinha\ModalAssinatura.tsx" 2>nul
move "%ORIGEM%\components\cozinha\ModalRevendedor.tsx" "%BASE%\components\cozinha\ModalRevendedor.tsx" 2>nul

REM 3.11 - COMPONENTES ADMIN
echo    Movendo componentes admin...
move "%ORIGEM%\app\admin-master\cozinha-chef\components\StatCard.tsx" "%BASE%\app\admin-master\cozinha-chef\components\StatCard.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\QuickLink.tsx" "%BASE%\app\admin-master\cozinha-chef\components\QuickLink.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\AlertCard.tsx" "%BASE%\app\admin-master\cozinha-chef\components\AlertCard.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\CardPratosDoDia.tsx" "%BASE%\app\admin-master\cozinha-chef\components\CardPratosDoDia.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\ExtratoCompras.tsx" "%BASE%\app\admin-master\cozinha-chef\components\ExtratoCompras.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\TabelaIngredientes.tsx" "%BASE%\app\admin-master\cozinha-chef\components\TabelaIngredientes.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\HeaderIngredientes.tsx" "%BASE%\app\admin-master\cozinha-chef\components\HeaderIngredientes.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\FiltrosIngredientes.tsx" "%BASE%\app\admin-master\cozinha-chef\components\FiltrosIngredientes.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\ModalIngrediente.tsx" "%BASE%\app\admin-master\cozinha-chef\components\ModalIngrediente.tsx" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\components\ModalFotoProduto.tsx" "%BASE%\app\admin-master\cozinha-chef\components\ModalFotoProduto.tsx" 2>nul

REM 3.12 - HOOKS
echo    Movendo hooks...
move "%ORIGEM%\hooks\cozinha\useReceitas.ts" "%BASE%\hooks\cozinha\useReceitas.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useReceita.ts" "%BASE%\hooks\cozinha\useReceita.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useEstoque.ts" "%BASE%\hooks\cozinha\useEstoque.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useCompras.ts" "%BASE%\hooks\cozinha\useCompras.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useMovimentacoes.ts" "%BASE%\hooks\cozinha\useMovimentacoes.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useFinanceiro.ts" "%BASE%\hooks\cozinha\useFinanceiro.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useCardapio.ts" "%BASE%\hooks\cozinha\useCardapio.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useCatalogo.ts" "%BASE%\hooks\cozinha\useCatalogo.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useDashboard.ts" "%BASE%\hooks\cozinha\useDashboard.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useEditarReceita.ts" "%BASE%\hooks\cozinha\useEditarReceita.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useHybridData.ts" "%BASE%\hooks\cozinha\useHybridData.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useIngredients.ts" "%BASE%\hooks\cozinha\useIngredients.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\usePerfilCozinha.ts" "%BASE%\hooks\cozinha\usePerfilCozinha.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useComprasRequests.ts" "%BASE%\hooks\cozinha\useComprasRequests.ts" 2>nul
move "%ORIGEM%\hooks\cozinha\useFinanceiroPessoal.ts" "%BASE%\hooks\cozinha\useFinanceiroPessoal.ts" 2>nul

REM 3.13 - SERVICES
echo    Movendo services...
move "%ORIGEM%\app\admin-master\cozinha-chef\services\receitaService.ts" "%BASE%\services\receitaService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\estoqueService.ts" "%BASE%\services\estoqueService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\comprasService.ts" "%BASE%\services\comprasService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\cardapioService.ts" "%BASE%\services\cardapioService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\financeiroService.ts" "%BASE%\services\financeiroService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\custoService.ts" "%BASE%\services\custoService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\dashboardService.ts" "%BASE%\services\dashboardService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\pedidoService.ts" "%BASE%\services\pedidoService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\producaoService.ts" "%BASE%\services\producaoService.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\services\pratosService.ts" "%BASE%\services\pratosService.ts" 2>nul
move "%ORIGEM%\services\cozinhaService.ts" "%BASE%\services\cozinhaService.ts" 2>nul

REM 3.14 - APIs
echo    Movendo APIs...
move "%ORIGEM%\app\api\cozinha\receitas\route.ts" "%BASE%\app\api\cozinha\receitas\route.ts" 2>nul
move "%ORIGEM%\app\api\cozinha\estoque\route.ts" "%BASE%\app\api\cozinha\estoque\route.ts" 2>nul
move "%ORIGEM%\app\api\cozinha\compras\route.ts" "%BASE%\app\api\cozinha\compras\route.ts" 2>nul
move "%ORIGEM%\app\api\cozinha\cardapio\route.ts" "%BASE%\app\api\cozinha\cardapio\route.ts" 2>nul
move "%ORIGEM%\app\api\cozinha\pratos\route.ts" "%BASE%\app\api\cozinha\pratos\route.ts" 2>nul
move "%ORIGEM%\app\api\cozinha\producao\route.ts" "%BASE%\app\api\cozinha\producao\route.ts" 2>nul
move "%ORIGEM%\app\api\cozinha\pedidos\route.ts" "%BASE%\app\api\cozinha\pedidos\route.ts" 2>nul

REM 3.15 - TYPES E CONFIGS
echo    Movendo types e configs...
move "%ORIGEM%\app\admin-master\cozinha-chef\types\index.ts" "%BASE%\types\cozinha.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\constants\ingredientesConstants.ts" "%BASE%\constants\ingredientesConstants.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\design.config.ts" "%BASE%\design.config.ts" 2>nul
move "%ORIGEM%\app\admin-master\cozinha-chef\estoque\design.config.ts" "%BASE%\design.config.ts" 2>nul

echo OK!

REM ==========================================
REM PASSO 4: REMOVER PASTAS VAZIAS E OBSOLETAS
REM ==========================================
echo [4/5] Removendo pastas obsoletas...
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\producao" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\pedidos" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\pratos" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\compras\ajuste" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\receitas\editar" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\receitas\[id]" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\pratos\editar" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\pratos\novo" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\estoque\movimentacao" 2>nul
rmdir /s /q "%ORIGEM%\app\cozinha\catalogo" 2>nul
rmdir /s /q "%ORIGEM%\hooks\cozinha" 2>nul
rmdir /s /q "%ORIGEM%\components\cozinha" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\components" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\services" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\hooks" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\types" 2>nul
rmdir /s /q "%ORIGEM%\app\admin-master\cozinha-chef\constants" 2>nul
rmdir /s /q "%ORIGEM%\app\api\cozinha\pratos" 2>nul
rmdir /s /q "%ORIGEM%\app\api\cozinha\producao" 2>nul
rmdir /s /q "%ORIGEM%\app\api\cozinha\pedidos" 2>nul
rmdir /s /q "%ORIGEM%\app\api\cozinha\financeiro" 2>nul
echo OK!

REM ==========================================
REM PASSO 5: REMOVER RAIZ ANTIGA
REM ==========================================
echo [5/5] Removendo pasta raiz antiga...
rmdir /s /q "%ORIGEM%" 2>nul
echo OK!

REM ==========================================
REM FINALIZAR
REM ==========================================
echo.
echo ==========================================
echo REESTRUTURACAO CONCLUIDA!
echo ==========================================
echo.
echo NOVA ESTRUTURA: c:\valente_conecta
echo.
echo PASTAS CRIADAS:
echo   - app/admin-master/cozinha-chef/ (8 paginas)
echo   - app/cozinha/cardapio/ (publico)
echo   - components/cozinha/ (6 componentes)
echo   - hooks/cozinha/ (15 hooks)
echo   - services/ (11 services)
echo   - app/api/cozinha/ (4 APIs)
echo   - types/ (1 type)
echo   - constants/ (1 constant)
echo   - utils/ (pasta vazia)
echo.
echo PROXIMO PASSO: Corrigir imports dos arquivos
echo.
pause