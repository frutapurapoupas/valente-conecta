# CHECKLIST_FINAL_COZINHA

## FLUXO 1 - Receita

- Criar receita (nome, ingredientes, custo, preco, imagem): OK
- Editar receita: OK
- Reabrir receita: OK
- Resultado esperado (receita salva e carregada corretamente): OK

## FLUXO 2 - Publicacao

- Receita -> Cardapio -> Preview: OK

## FLUXO 3 - Cliente

- Home: OK
- Marmitas: OK
- Catalogo publico: OK
- Visualizacao do produto: OK

## FLUXO 4 - Admin

- Dashboard Cozinha: OK
- Financeiro: OK
- Receitas: FALHA
  - arquivo: app/admin-master/cozinha-chef/receitas/page.tsx
  - causa: erro de carregamento do bundle da rota no browser (GET /_next/static/chunks/app/admin-master/cozinha-chef/receitas/page.js retornando 404 e MIME text/html), impedindo renderizacao normal da tela.
- Estoque: OK
- Movimentacoes: OK
- Compras: OK
- Pratos: OK
- Producao: OK
- Pedidos: OK
- Preview: OK
