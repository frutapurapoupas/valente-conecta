# COZINHA CHEF NEIDE
# ARQUITETURA FUNCIONAL DO MÓDULO

Versão: 1.0  
Projeto: Valente Conecta  
Módulo: Cozinha Chef Neide  

---

# 1. OBJETIVO DESTE DOCUMENTO

Este documento define o funcionamento esperado do módulo Cozinha Chef Neide.

Ele descreve:

- responsabilidades de cada área;
- fluxo do usuário;
- regras de negócio;
- relacionamento entre módulos;
- comportamento esperado das telas;
- origem e destino das informações.

Este documento deve ser utilizado como referência por:

- desenvolvedores;
- agentes de IA;
- equipe de produto;
- manutenção futura.

---

# 2. PRINCÍPIO FUNCIONAL PRINCIPAL

O módulo possui uma entidade central:

# RECEITA

Toda operação deve nascer da receita.

Fluxo oficial:


RECEITA

↓

Ingredientes

↓

Ficha Técnica

↓

Custos

↓

Preço Venda

↓

Catálogo

↓

Pedidos

↓

Produção

↓

Estoque

↓

Compras

↓

Financeiro


Nenhuma área deve criar informações que pertencem à receita.

---

# 3. ESTRUTURA PRINCIPAL DO MENU

Menu atual:

1. Dashboard Cozinha
2. Financeiro Cozinha
3. Pratos & Produtos
4. Receitas
5. Estoque
6. Movimentação Estoque
7. Produção
8. Lista de Compras
9. Pedidos
10. Preview Cardápio

A estrutura deve permanecer, porém cada item deve ter uma responsabilidade clara.

---

# 4. RECEITAS

## Objetivo

Ser o coração operacional do módulo.

A tela de receitas deve permitir criar uma ficha técnica completa.

---

# 4.1 Cadastro básico

Campos:

- nome da receita;
- categoria;
- descrição;
- imagem principal;
- status;
- disponibilidade;
- observações.

Exemplos:

- Marmita Carne de Panela
- Marmita Frango Cremoso
- Pudim Caseiro
- Doce de Leite

---

# 4.2 Ingredientes da Receita

Cada receita possui uma lista de ingredientes.

Estrutura:


Ingrediente

Quantidade

Unidade

Preço unitário

Custo calculado


Exemplo:


Arroz

500g

R$ 5,00/kg

Custo:
R$ 2,50


---

# 4.3 Ficha Técnica

A receita deve armazenar:

- peso inicial;
- peso final;
- perda de produção;
- rendimento;
- quantidade de porções;
- tamanho da porção.

Exemplo:


Peso ingredientes:
5kg

Após preparo:
4,2kg

Rendimento:
10 marmitas


---

# 4.4 Formação de custo

O sistema deve calcular:

## Custos diretos

- ingredientes;
- embalagens.

## Custos indiretos

- gás;
- energia;
- mão de obra;
- outros custos.

Resultado:


Custo total da receita

÷

Quantidade produzida

=

Custo unitário


---

# 4.5 Formação de preço

A receita deve permitir:

- margem desejada;
- percentual de lucro;
- preço sugerido;
- preço final.

Exemplo:


Custo marmita:
R$ 8,00

Margem:
40%

Preço sugerido:
R$ 13,33


---

# 4.6 Publicação

A receita pode ser publicada em:

- catálogo público;
- cardápio;
- pedidos.

A publicação não cria novo cadastro.

Ela apenas altera a disponibilidade.

---

# 5. PRATOS & PRODUTOS

## Objetivo

Visualização comercial das receitas.

Não deve possuir cadastro independente.

A origem dos produtos deve ser:


Receita publicada


Responsabilidades:

- organizar apresentação;
- categorias;
- disponibilidade;
- destaque.

Não deve possuir:

- custo próprio;
- ingredientes próprios;
- preço independente.

---

# 6. ESTOQUE

## Objetivo

Controlar ingredientes utilizados pelas receitas.

O estoque trabalha com:

- ingredientes;
- unidades;
- quantidade atual;
- estoque mínimo.

---

# 6.1 Relação com receita

Quando uma receita é produzida:

Exemplo:

Produção:

100 marmitas

Sistema calcula:


Receita Marmita

x100

=

necessidade de ingredientes


Baixa automaticamente:

- arroz;
- carne;
- temperos;
- embalagens.

---

# 7. MOVIMENTAÇÃO DE ESTOQUE

## Objetivo

Registrar eventos.

Tipos:

Entrada:

- compra;
- ajuste;
- devolução.

Saída:

- produção;
- perda;
- ajuste.

Toda movimentação deve possuir:

- data;
- usuário;
- motivo;
- origem.

---

# 8. PRODUÇÃO

## Objetivo

Transformar receitas em produtos produzidos.

Fluxo:


Escolher receita

↓

Informar quantidade

↓

Sistema calcula ingredientes

↓

Verificar estoque

↓

Executar produção

↓

Atualizar estoque


---

# 8.1 Ordem de produção

Deve registrar:

- receita utilizada;
- quantidade planejada;
- quantidade produzida;
- perdas;
- responsável;
- data.

---

# 9. LISTA DE COMPRAS

## Objetivo

Ser consequência do estoque e produção.

Nunca deve ser uma lista manual isolada.

Fluxo:


Produção planejada

Estoque atual

=

Necessidade de compra


Exemplo:

Produzir:

100 marmitas

Necessário:

20kg arroz

Estoque:

5kg

Gerar compra:

15kg arroz

---

# 10. PEDIDOS

## Objetivo

Vender produtos originados das receitas.

Fluxo:


Pedido

↓

Produto

↓

Receita

↓

Produção

↓

Estoque


Pedido deve conhecer:

- receita vendida;
- quantidade;
- preço;
- cliente;
- status.

---

# 11. PREVIEW CARDÁPIO

## Objetivo

Visualizar exatamente como o cliente verá.

Origem:


Receitas publicadas


Exibe:

- imagem;
- nome;
- descrição;
- preço;
- disponibilidade.

Não possui cadastro próprio.

---

# 12. FINANCEIRO COZINHA

## Objetivo

Demonstrar resultado operacional.

Deve consumir:

- vendas;
- custos das receitas;
- produção.

Indicadores:

- faturamento;
- custo produzido;
- lucro bruto;
- margem;
- produtos mais rentáveis.

---

# 13. DASHBOARD COZINHA

## Objetivo

Ser o painel operacional.

Informações:

Produção:

- receitas produzidas;
- quantidade.

Estoque:

- itens críticos;
- faltas.

Financeiro:

- vendas;
- lucro.

Compras:

- pendências.

---

# 14. FLUXO COMPLETO DO SISTEMA

Exemplo:

Novo produto:

"Marmita Frango"

↓

Criar receita

↓

Adicionar ingredientes

↓

Calcular custo

↓

Definir preço

↓

Adicionar imagem

↓

Publicar catálogo

↓

Cliente realiza pedido

↓

Produção recebe ordem

↓

Estoque baixa ingredientes

↓

Financeiro calcula resultado

---

# 15. REGRAS OBRIGATÓRIAS

## Nunca:

Criar produto separado da receita.

Criar preço duplicado.

Criar ingrediente duplicado.

Criar catálogo independente.

Criar estoque independente de ingredientes.

---

# 16. CRITÉRIO DE SUCESSO

O módulo estará correto quando:

Um usuário conseguir:

"Criar uma nova marmita em uma única sequência"

e automaticamente o sistema conseguir:

- calcular custo;
- sugerir preço;
- publicar catálogo;
- gerar produção;
- controlar estoque;
- gerar compras;
- calcular lucro.

---

# 17. REGRA PARA FUTURAS ALTERAÇÕES

Antes de criar qualquer funcionalidade perguntar:

Esta funcionalidade nasce da Receita?

Se sim:
Implementar.

Se não:
Reavaliar arquitetura.

---

Fim do documento.