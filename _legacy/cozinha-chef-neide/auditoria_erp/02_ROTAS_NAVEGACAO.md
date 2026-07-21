# 02 - ROTAS E NAVEGACAO
# Gerado em 16/07/2026 17:29

## ROTAS PUBLICAS

| Rota | Arquivo | Status |
|------|---------|--------|
| /cozinha | app/cozinha/page.tsx | Publico |
| /cozinha/catalogo | app/cozinha/catalogo/page.tsx | Publico |

## ROTAS ADMINISTRATIVAS

| Rota | Arquivo | Funcao |
|------|---------|--------|
| /admin-master/cozinha-chef | cozinha-chef/page.tsx | Dashboard |
| /admin-master/cozinha-chef/receitas | cozinha-chef/receitas/page.tsx | Gerenciar Receitas |
| /admin-master/cozinha-chef/receitas/editar/[id] | cozinha-chef/receitas/editar/[id]/page.tsx | Editar Receita |
| /admin-master/cozinha-chef/pratos | cozinha-chef/pratos/page.tsx | Gerenciar Pratos |
| /admin-master/cozinha-chef/estoque | cozinha-chef/estoque/page.tsx | Gerenciar Estoque |
| /admin-master/cozinha-chef/compras | cozinha-chef/compras/page.tsx | Lista de Compras |
| /admin-master/cozinha-chef/producao | cozinha-chef/producao/page.tsx | Producao |
| /admin-master/cozinha-chef/pedidos | cozinha-chef/pedidos/page.tsx | Pedidos |
| /admin-master/cozinha-chef/financeiro | cozinha-chef/financeiro/page.tsx | Financeiro |
| /admin-master/cozinha-chef/preview | cozinha-chef/preview/page.tsx | Preview Cardapio |

## APIs

| Rota | Metodos |
|------|---------|
| /api/cozinha/receitas | GET, POST, PUT, DELETE |
| /api/cozinha/estoque | GET, POST, PUT, DELETE |
| /api/cozinha/compras | GET, POST, PUT, DELETE |
| /api/cozinha/producao | GET, POST, PUT, DELETE |
| /api/cozinha/pedidos | GET, POST, PUT, DELETE |
| /api/cozinha/cardapio | GET |
