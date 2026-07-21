# 03 - FLUXO DO USUARIO
# Gerado em 16/07/2026 15:59

## Fluxo Completo: Home -> Marmita -> Catalogo -> Pedido -> Admin

HOME (/)
    |
    +-- Botao "MARMITA"
    |       |
    |       v
    |   /cozinha (Selecao de Perfil)
    |       |
    |       +-- "Publico Geral" -> /cozinha/catalogo?perfil=publico
    |       +-- "Assinante" -> /cozinha/catalogo?perfil=assinante
    |       +-- "Revendedor" -> /cozinha/catalogo?perfil=revendedor
    |           |
    |           v
    |       /cozinha/catalogo
    |           |
    |           +-- Visualiza pratos
    |           +-- Clique em um prato -> /cozinha/produto/[id]
    |           +-- Clique "Comprar" -> /cozinha/pedido/novo
    |               |
    |               v
    |           /cozinha/pedido/novo
    |               |
    |               +-- Finaliza pedido
    |               v
    |           /cozinha/pagamento/[id]
    |               |
    |               +-- Efetua pagamento
    |               v
    |           /cozinha/retirada/[id]
    |
    +-- Botao "ADMIN COZINHA"
            |
            v
        /admin-master/cozinha-chef
            |
            +-- Dashboard
            +-- Compras
            +-- Estoque
            +-- Pedidos
            +-- Producao
            +-- Financeiro
            +-- Receitas
            +-- Pratos

## Paginas por Funcao

| Funcao | Pagina | Componentes | Hooks |
|--------|--------|-------------|-------|
| Selecao Perfil | /cozinha | SelecaoPerfilUI | usePerfilCozinha |
| Catalogo | /cozinha/catalogo | CatalogoUI | useCatalogo |
| Dashboard Admin | /admin-master/cozinha-chef | DashboardUI | useDashboard |
| Estoque | /admin-master/cozinha-chef/estoque | EstoqueUI | useEstoque |
| Receitas | /admin-master/cozinha-chef/receitas | ReceitaUI | useReceitas |
| Compras | /admin-master/cozinha-chef/compras | ComprasUI | useCompras |
| Producao | /admin-master/cozinha-chef/producao | ProducaoUI | useProducao |
