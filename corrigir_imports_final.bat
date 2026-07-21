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
if exist "%BASE%\app\admin-master\cozinha-chef\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useDashboard.', 'from @/hooks/cozinha/useDashboard'; $content = $content -replace 'from .@/components/cozinha/DashboardUI.', 'from @/components/cozinha/DashboardUI'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/', 'from @/app/admin-master/cozinha-chef/components/'; Set-Content '%BASE%\app\admin-master\cozinha-chef\page.tsx' -Value $content"
    echo    ✅ Dashboard corrigido
)

REM ==========================================
REM PAGINA RECEITAS
REM ==========================================
echo    Corrigindo Receitas...
if exist "%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useReceitas.', 'from @/hooks/cozinha/useReceitas'; $content = $content -replace 'from .@/components/cozinha/ReceitaForm.', 'from @/components/cozinha/ReceitaForm'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/ModalIngrediente.', 'from @/app/admin-master/cozinha-chef/components/ModalIngrediente'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/ModalFotoProduto.', 'from @/app/admin-master/cozinha-chef/components/ModalFotoProduto'; Set-Content '%BASE%\app\admin-master\cozinha-chef\receitas\page.tsx' -Value $content"
    echo    ✅ Receitas corrigido
)

REM ==========================================
REM PAGINA ESTOQUE
REM ==========================================
echo    Corrigindo Estoque...
if exist "%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useEstoque.', 'from @/hooks/cozinha/useEstoque'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/TabelaIngredientes.', 'from @/app/admin-master/cozinha-chef/components/TabelaIngredientes'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/HeaderIngredientes.', 'from @/app/admin-master/cozinha-chef/components/HeaderIngredientes'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/FiltrosIngredientes.', 'from @/app/admin-master/cozinha-chef/components/FiltrosIngredientes'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/ModalIngrediente.', 'from @/app/admin-master/cozinha-chef/components/ModalIngrediente'; Set-Content '%BASE%\app\admin-master\cozinha-chef\estoque\page.tsx' -Value $content"
    echo    ✅ Estoque corrigido
)

REM ==========================================
REM PAGINA COMPRAS
REM ==========================================
echo    Corrigindo Compras...
if exist "%BASE%\app\admin-master\cozinha-chef\compras\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useCompras.', 'from @/hooks/cozinha/useCompras'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/ExtratoCompras.', 'from @/app/admin-master/cozinha-chef/components/ExtratoCompras'; Set-Content '%BASE%\app\admin-master\cozinha-chef\compras\page.tsx' -Value $content"
    echo    ✅ Compras corrigido
)

REM ==========================================
REM PAGINA MOVIMENTACOES
REM ==========================================
echo    Corrigindo Movimentacoes...
if exist "%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useMovimentacoes.', 'from @/hooks/cozinha/useMovimentacoes'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/TabelaIngredientes.', 'from @/app/admin-master/cozinha-chef/components/TabelaIngredientes'; Set-Content '%BASE%\app\admin-master\cozinha-chef\movimentacoes\page.tsx' -Value $content"
    echo    ✅ Movimentacoes corrigido
) else (
    echo    ⚠️ Movimentacoes nao encontrado
)

REM ==========================================
REM PAGINA FINANCEIRO
REM ==========================================
echo    Corrigindo Financeiro...
if exist "%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useFinanceiro.', 'from @/hooks/cozinha/useFinanceiro'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/ExtratoCompras.', 'from @/app/admin-master/cozinha-chef/components/ExtratoCompras'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/StatCard.', 'from @/app/admin-master/cozinha-chef/components/StatCard'; Set-Content '%BASE%\app\admin-master\cozinha-chef\financeiro\page.tsx' -Value $content"
    echo    ✅ Financeiro corrigido
)

REM ==========================================
REM PAGINA PREVIEW
REM ==========================================
echo    Corrigindo Preview...
if exist "%BASE%\app\admin-master\cozinha-chef\preview\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useCardapio.', 'from @/hooks/cozinha/useCardapio'; $content = $content -replace 'from .@/components/cozinha/CatalogoUI.', 'from @/components/cozinha/CatalogoUI'; Set-Content '%BASE%\app\admin-master\cozinha-chef\preview\page.tsx' -Value $content"
    echo    ✅ Preview corrigido
)

REM ==========================================
REM PAGINA CARDAPIO PUBLICO
REM ==========================================
echo    Corrigindo Cardapio Publico...
if exist "%BASE%\app\cozinha\cardapio\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\cozinha\cardapio\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useCatalogo.', 'from @/hooks/cozinha/useCatalogo'; $content = $content -replace 'from .@/components/cozinha/CatalogoUI.', 'from @/components/cozinha/CatalogoUI'; Set-Content '%BASE%\app\cozinha\cardapio\page.tsx' -Value $content"
    echo    ✅ Cardapio Publico corrigido
)

REM ==========================================
REM PAGINA INICIAL PUBLICA
REM ==========================================
echo    Corrigindo Pagina Inicial Publica...
if exist "%BASE%\app\cozinha\page.tsx" (
    powershell -Command "$content = Get-Content '%BASE%\app\cozinha\page.tsx' -Raw; $content = $content -replace 'from .@/hooks/cozinha/useCatalogo.', 'from @/hooks/cozinha/useCatalogo'; $content = $content -replace 'from .@/components/cozinha/CatalogoUI.', 'from @/components/cozinha/CatalogoUI'; $content = $content -replace 'from .@/components/cozinha/SelecaoPerfilUI.', 'from @/components/cozinha/SelecaoPerfilUI'; $content = $content -replace 'from .@/components/cozinha/ModalAssinatura.', 'from @/components/cozinha/ModalAssinatura'; $content = $content -replace 'from .@/components/cozinha/ModalRevendedor.', 'from @/components/cozinha/ModalRevendedor'; Set-Content '%BASE%\app\cozinha\page.tsx' -Value $content"
    echo    ✅ Pagina Inicial Publica corrigido
)

echo.
echo [2/4] Corrigindo imports dos COMPONENTES...
echo.

REM ==========================================
REM CORRIGIR COMPONENTES
REM ==========================================
if exist "%BASE%\components\cozinha" (
    echo    Corrigindo componentes em components/cozinha/...
    powershell -Command "Get-ChildItem '%BASE%\components\cozinha\*.tsx' | ForEach-Object { $content = Get-Content $_.FullName -Raw; $content = $content -replace 'from .@/hooks/cozinha/', 'from @/hooks/cozinha/'; $content = $content -replace 'from .@/services/', 'from @/services/'; $content = $content -replace 'from .@/types/', 'from @/types/'; $content = $content -replace 'from .@/constants/', 'from @/constants/'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/components/', 'from @/app/admin-master/cozinha-chef/components/'; Set-Content $_.FullName -Value $content }"
    echo    ✅ Componentes corrigidos
)

REM ==========================================
REM CORRIGIR COMPONENTES ADMIN
REM ==========================================
if exist "%BASE%\app\admin-master\cozinha-chef\components" (
    echo    Corrigindo componentes em admin-master/cozinha-chef/components/...
    powershell -Command "Get-ChildItem '%BASE%\app\admin-master\cozinha-chef\components\*.tsx' | ForEach-Object { $content = Get-Content $_.FullName -Raw; $content = $content -replace 'from .@/hooks/cozinha/', 'from @/hooks/cozinha/'; $content = $content -replace 'from .@/services/', 'from @/services/'; $content = $content -replace 'from .@/types/', 'from @/types/'; $content = $content -replace 'from .@/constants/', 'from @/constants/'; Set-Content $_.FullName -Value $content }"
    echo    ✅ Componentes Admin corrigidos
)

echo.
echo [3/4] Corrigindo imports dos HOOKS...
echo.

REM ==========================================
REM CORRIGIR HOOKS
REM ==========================================
if exist "%BASE%\hooks\cozinha" (
    echo    Corrigindo hooks...
    powershell -Command "Get-ChildItem '%BASE%\hooks\cozinha\*.ts' | ForEach-Object { $content = Get-Content $_.FullName -Raw; $content = $content -replace 'from .@/services/', 'from @/services/'; $content = $content -replace 'from .@/types/', 'from @/types/'; $content = $content -replace 'from .@/lib/', 'from @/lib/'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/services/', 'from @/services/'; Set-Content $_.FullName -Value $content }"
    echo    ✅ Hooks corrigidos
)

echo.
echo [4/4] Corrigindo imports dos SERVICES e APIS...
echo.

REM ==========================================
REM CORRIGIR SERVICES
REM ==========================================
if exist "%BASE%\services" (
    echo    Corrigindo services...
    powershell -Command "Get-ChildItem '%BASE%\services\*.ts' | ForEach-Object { $content = Get-Content $_.FullName -Raw; $content = $content -replace 'from .@/lib/', 'from @/lib/'; $content = $content -replace 'from .@/types/', 'from @/types/'; $content = $content -replace 'from .@/app/admin-master/cozinha-chef/types/', 'from @/types/'; Set-Content $_.FullName -Value $content }"
    echo    ✅ Services corrigidos
)

REM ==========================================
REM CORRIGIR APIS
REM ==========================================
if exist "%BASE%\app\api\cozinha" (
    echo    Corrigindo APIs...
    powershell -Command "Get-ChildItem '%BASE%\app\api\cozinha\*\route.ts' | ForEach-Object { $content = Get-Content $_.FullName -Raw; $content = $content -replace 'from .@/services/', 'from @/services/'; $content = $content -replace 'from .@/lib/', 'from @/lib/'; $content = $content -replace 'from .@/types/', 'from @/types/'; Set-Content $_.FullName -Value $content }"
    echo    ✅ APIs corrigidas
)

echo.
echo ==========================================
echo CORRECAO DE IMPORTS CONCLUIDA!
echo ==========================================
echo.
echo ARQUIVOS CORRIGIDOS:
echo   ✅ Dashboard
echo   ✅ Receitas
echo   ✅ Estoque
echo   ✅ Compras
echo   ✅ Movimentacoes
echo   ✅ Financeiro
echo   ✅ Preview
echo   ✅ Cardapio Publico
echo   ✅ Pagina Inicial Publica
echo   ✅ Todos os Componentes
echo   ✅ Todos os Hooks
echo   ✅ Todos os Services
echo   ✅ Todas as APIs
echo.
echo PROXIMO PASSO:
echo   1. Execute 'npm run build' para verificar erros
echo   2. Corrija manualmente se necessario
echo.
pause