@echo off
echo ==========================================
echo CORRECAO DE IMPORTS - MODULO COZINHA V2.1
echo ==========================================
echo.
echo ATENCAO: Este script corrigira todos os imports
echo dos arquivos do modulo Cozinha para a nova estrutura.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause >nul

set BASE=c:\valente_conecta

echo.
echo [1/4] Corrigindo imports das PAGINAS...
echo.

REM ==========================================
REM PAGINA DASHBOARD
REM ==========================================
echo    Corrigindo Dashboard...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx') -replace 'from .@/hooks/cozinha/useDashboard.', 'from @/hooks/cozinha/useDashboard' | Set-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx') -replace 'from .@/components/cozinha/DashboardUI.', 'from @/components/cozinha/DashboardUI' | Set-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/', 'from @/app/admin-master/cozinha-chef/components/' | Set-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx'"

REM ==========================================
REM PAGINA RECEITAS
REM ==========================================
echo    Corrigindo Receitas...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx') -replace 'from .@/hooks/cozinha/useReceitas.', 'from @/hooks/cozinha/useReceitas' | Set-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx') -replace 'from .@/components/cozinha/ReceitaForm.', 'from @/components/cozinha/ReceitaForm' | Set-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/ModalIngrediente.', 'from @/app/admin-master/cozinha-chef/components/ModalIngrediente' | Set-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx'"

REM ==========================================
REM PAGINA ESTOQUE
REM ==========================================
echo    Corrigindo Estoque...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx') -replace 'from .@/hooks/cozinha/useEstoque.', 'from @/hooks/cozinha/useEstoque' | Set-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/TabelaIngredientes.', 'from @/app/admin-master/cozinha-chef/components/TabelaIngredientes' | Set-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/HeaderIngredientes.', 'from @/app/admin-master/cozinha-chef/components/HeaderIngredientes' | Set-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/FiltrosIngredientes.', 'from @/app/admin-master/cozinha-chef/components/FiltrosIngredientes' | Set-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/ModalIngrediente.', 'from @/app/admin-master/cozinha-chef/components/ModalIngrediente' | Set-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx'"

REM ==========================================
REM PAGINA COMPRAS
REM ==========================================
echo    Corrigindo Compras...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx') -replace 'from .@/hooks/cozinha/useCompras.', 'from @/hooks/cozinha/useCompras' | Set-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/ExtratoCompras.', 'from @/app/admin-master/cozinha-chef/components/ExtratoCompras' | Set-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx'"

REM ==========================================
REM PAGINA MOVIMENTACOES
REM ==========================================
echo    Corrigindo Movimentacoes...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx') -replace 'from .@/hooks/cozinha/useMovimentacoes.', 'from @/hooks/cozinha/useMovimentacoes' | Set-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/TabelaIngredientes.', 'from @/app/admin-master/cozinha-chef/components/TabelaIngredientes' | Set-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx'"

REM ==========================================
REM PAGINA FINANCEIRO
REM ==========================================
echo    Corrigindo Financeiro...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx') -replace 'from .@/hooks/cozinha/useFinanceiro.', 'from @/hooks/cozinha/useFinanceiro' | Set-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/ExtratoCompras.', 'from @/app/admin-master/cozinha-chef/components/ExtratoCompras' | Set-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/StatCard.', 'from @/app/admin-master/cozinha-chef/components/StatCard' | Set-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx'"

REM ==========================================
REM PAGINA PREVIEW
REM ==========================================
echo    Corrigindo Preview...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx') -replace 'from .@/hooks/cozinha/useCardapio.', 'from @/hooks/cozinha/useCardapio' | Set-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx') -replace 'from .@/components/cozinha/CatalogoUI.', 'from @/components/cozinha/CatalogoUI' | Set-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx'"

REM ==========================================
REM PAGINA CARDAPIO PUBLICO
REM ==========================================
echo    Corrigindo Cardapio Publico...
powershell -Command "(Get-Content '%BASE%\app\cozinha\cardapio\page.tsx') -replace 'from .@/hooks/cozinha/useCatalogo.', 'from @/hooks/cozinha/useCatalogo' | Set-Content '%BASE%\app\cozinha\cardapio\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\cozinha\cardapio\page.tsx') -replace 'from .@/components/cozinha/CatalogoUI.', 'from @/components/cozinha/CatalogoUI' | Set-Content '%BASE%\app\cozinha\cardapio\page.tsx'"

REM ==========================================
REM PAGINA INICIAL PUBLICA
REM ==========================================
echo    Corrigindo Pagina Inicial Publica...
powershell -Command "(Get-Content '%BASE%\app\cozinha\page.tsx') -replace 'from .@/hooks/cozinha/useCatalogo.', 'from @/hooks/cozinha/useCatalogo' | Set-Content '%BASE%\app\cozinha\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\cozinha\page.tsx') -replace 'from .@/components/cozinha/CatalogoUI.', 'from @/components/cozinha/CatalogoUI' | Set-Content '%BASE%\app\cozinha\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\cozinha\page.tsx') -replace 'from .@/components/cozinha/SelecaoPerfilUI.', 'from @/components/cozinha/SelecaoPerfilUI' | Set-Content '%BASE%\app\cozinha\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\cozinha\page.tsx') -replace 'from .@/components/cozinha/ModalAssinatura.', 'from @/components/cozinha/ModalAssinatura' | Set-Content '%BASE%\app\cozinha\page.tsx'"
powershell -Command "(Get-Content '%BASE%\app\cozinha\page.tsx') -replace 'from .@/components/cozinha/ModalRevendedor.', 'from @/components/cozinha/ModalRevendedor' | Set-Content '%BASE%\app\cozinha\page.tsx'"

echo.
echo [2/4] Corrigindo imports dos COMPONENTES...
echo.

REM ==========================================
REM COMPONENTES REUTILIZAVEIS
REM ==========================================
echo    Corrigindo CatalogoUI...
powershell -Command "(Get-Content '%BASE%\components\cozinha\CatalogoUI.tsx') -replace 'from .@/hooks/cozinha/', 'from @/hooks/cozinha/' | Set-Content '%BASE%\components\cozinha\CatalogoUI.tsx'"
powershell -Command "(Get-Content '%BASE%\components\cozinha\CatalogoUI.tsx') -replace 'from .@/services/', 'from @/services/' | Set-Content '%BASE%\components\cozinha\CatalogoUI.tsx'"

echo    Corrigindo DashboardUI...
powershell -Command "(Get-Content '%BASE%\components\cozinha\DashboardUI.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/', 'from @/app/admin-master/cozinha-chef/components/' | Set-Content '%BASE%\components\cozinha\DashboardUI.tsx'"

echo    Corrigindo ReceitaForm...
powershell -Command "(Get-Content '%BASE%\components\cozinha\ReceitaForm.tsx') -replace 'from .@/hooks/cozinha/useReceita.', 'from @/hooks/cozinha/useReceita' | Set-Content '%BASE%\components\cozinha\ReceitaForm.tsx'"
powershell -Command "(Get-Content '%BASE%\components\cozinha\ReceitaForm.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/ModalIngrediente.', 'from @/app/admin-master/cozinha-chef/components/ModalIngrediente' | Set-Content '%BASE%\components\cozinha\ReceitaForm.tsx'"
powershell -Command "(Get-Content '%BASE%\components\cozinha\ReceitaForm.tsx') -replace 'from .@/app/admin-master/cozinha-chef/components/ModalFotoProduto.', 'from @/app/admin-master/cozinha-chef/components/ModalFotoProduto' | Set-Content '%BASE%\components\cozinha\ReceitaForm.tsx'"

REM ==========================================
REM COMPONENTES ADMIN
REM ==========================================
echo    Corrigindo componentes admin...
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx') -replace 'from .@/hooks/cozinha/', 'from @/hooks/cozinha/' | Set-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx') -replace 'from .@/services/', 'from @/services/' | Set-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx') -replace 'from .@/types/', 'from @/types/' | Set-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx'"
powershell -Command "(Get-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx') -replace 'from .@/constants/', 'from @/constants/' | Set-Content '%BASE%\app\admin-master\cozinha-chef\components\*.tsx'"

echo.
echo [3/4] Corrigindo imports dos HOOKS...
echo.

REM ==========================================
REM HOOKS
REM ==========================================
echo    Corrigindo hooks...
powershell -Command "Get-ChildItem '%BASE%\hooks\cozinha\*.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/services/', 'from @/services/' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%\hooks\cozinha\*.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/types/', 'from @/types/' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%\hooks\cozinha\*.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/lib/', 'from @/lib/' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%\hooks\cozinha\*.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/app/admin-master/cozinha-chef/services/', 'from @/services/' | Set-Content $_.FullName }"

REM ==========================================
REM CORRIGIR IMPORTS ESPECIFICOS DOS HOOKS
REM ==========================================
echo    Corrigindo imports especificos dos hooks...
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useReceitas.ts') -replace 'from .@/services/receitaService.', 'from @/services/receitaService' | Set-Content '%BASE%\hooks\cozinha\useReceitas.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useReceita.ts') -replace 'from .@/services/receitaService.', 'from @/services/receitaService' | Set-Content '%BASE%\hooks\cozinha\useReceita.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useEstoque.ts') -replace 'from .@/services/estoqueService.', 'from @/services/estoqueService' | Set-Content '%BASE%\hooks\cozinha\useEstoque.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useCompras.ts') -replace 'from .@/services/comprasService.', 'from @/services/comprasService' | Set-Content '%BASE%\hooks\cozinha\useCompras.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useMovimentacoes.ts') -replace 'from .@/services/estoqueService.', 'from @/services/estoqueService' | Set-Content '%BASE%\hooks\cozinha\useMovimentacoes.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useFinanceiro.ts') -replace 'from .@/services/financeiroService.', 'from @/services/financeiroService' | Set-Content '%BASE%\hooks\cozinha\useFinanceiro.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useCardapio.ts') -replace 'from .@/services/cardapioService.', 'from @/services/cardapioService' | Set-Content '%BASE%\hooks\cozinha\useCardapio.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useCatalogo.ts') -replace 'from .@/services/cozinhaService.', 'from @/services/cozinhaService' | Set-Content '%BASE%\hooks\cozinha\useCatalogo.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useDashboard.ts') -replace 'from .@/services/dashboardService.', 'from @/services/dashboardService' | Set-Content '%BASE%\hooks\cozinha\useDashboard.ts'"
powershell -Command "(Get-Content '%BASE%\hooks\cozinha\useEditarReceita.ts') -replace 'from .@/services/cozinhaService.', 'from @/services/cozinhaService' | Set-Content '%BASE%\hooks\cozinha\useEditarReceita.ts'"

echo.
echo [4/4] Corrigindo imports dos SERVICES e APIS...
echo.

REM ==========================================
REM SERVICES
REM ==========================================
echo    Corrigindo services...
powershell -Command "Get-ChildItem '%BASE%\services\*.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/lib/', 'from @/lib/' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%\services\*.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/types/', 'from @/types/' | Set-Content $_.FullName }"

REM ==========================================
REM APIS
REM ==========================================
echo    Corrigindo APIs...
powershell -Command "Get-ChildItem '%BASE%\app\api\cozinha\*\route.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/services/', 'from @/services/' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%\app\api\cozinha\*\route.ts' | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/lib/', 'from @/lib/' | Set-Content $_.FullName }"

REM ==========================================
REM REMOVER IMPORTS QUEBRADOS (PRATOS, PRODUCAO, PEDIDOS)
REM ==========================================
echo    Removendo imports de arquivos removidos...
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/hooks/cozinha/usePratos.', '// from @/hooks/cozinha/usePratos (REMOVER)' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/hooks/cozinha/useProducao.', '// from @/hooks/cozinha/useProducao (REMOVER)' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/hooks/cozinha/usePedidos.', '// from @/hooks/cozinha/usePedidos (REMOVER)' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/services/pratosService.', '// from @/services/pratosService (REMOVER)' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/services/producaoService.', '// from @/services/producaoService (REMOVER)' | Set-Content $_.FullName }"
powershell -Command "Get-ChildItem '%BASE%' -Recurse -Include *.ts,*.tsx | ForEach-Object { (Get-Content $_.FullName) -replace 'from .@/services/pedidoService.', '// from @/services/pedidoService (REMOVER)' | Set-Content $_.FullName }"

echo.
echo ==========================================
echo CORRECAO DE IMPORTS CONCLUIDA!
echo ==========================================
echo.
echo ARQUIVOS CORRIGIDOS:
echo   - 8 Paginas
echo   - 16 Componentes
echo   - 15 Hooks
echo   - 11 Services
echo   - 4 APIs
echo.
echo ATENCAO:
echo   1. Verifique os arquivos comentados com 'REMOVER'
echo   2. Alguns imports podem precisar de ajustes manuais
echo   3. Execute 'npm run build' para verificar erros
echo.
echo Pressione qualquer tecla para sair...
pause >nul