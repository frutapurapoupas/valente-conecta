# 03_PROMPT_EXECUCAO_RESTAURACAO_COZINHA_CHEF_NEIDE.md

Versão: 1.0  
Projeto: Valente Conecta  
Módulo: Cozinha Chef Neide  

---

# PROMPT OFICIAL PARA AGENTES DE IA

## RESTAURAÇÃO, AUDITORIA E EVOLUÇÃO DO MÓDULO COZINHA CHEF NEIDE

---

## 1. CONTEXTO DO TRABALHO

Você está trabalhando no projeto Valente Conecta.

O módulo Cozinha Chef Neide passou recentemente por processos de:

- limpeza;
- auditoria;
- refatoração;
- reorganização de código.

Porém, existe suspeita de que durante esse processo o módulo tenha perdido parte da sua visão original, fluxos funcionais e integrações existentes.

O objetivo NÃO é criar um novo sistema.

O objetivo é:

> Recuperar, organizar e evoluir a melhor versão funcional já existente utilizando o código atual como base.

---

# 2. DOCUMENTOS OBRIGATÓRIOS

Antes de analisar ou modificar qualquer arquivo, leia obrigatoriamente:


docs/cozinha-chef-neide/

00_FILOSOFIA_DO_MODULO.md

01_ARQUITETURA_FUNCIONAL.md

02_ARQUITETURA_TECNICA.md


Esses documentos representam a especificação oficial do módulo.

Toda decisão técnica deve respeitar esses documentos.

Caso encontre conflito entre código atual e documentação:

Não substituir automaticamente.

Primeiro identificar:

- o que existia;
- o que foi alterado;
- qual comportamento atende melhor ao objetivo do módulo.

---

# 3. REGRA PRINCIPAL

A entidade central do módulo é:

# RECEITA

A arquitetura obrigatória é:


RECEITA

↓

Ingredientes

↓

Ficha Técnica

↓

Custos

↓

Preço

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


Toda alteração deve fortalecer esse fluxo.

---

# 4. PROIBIÇÕES

Não faça:

- nova refatoração geral;
- criação de módulos paralelos;
- criação de cadastros duplicados;
- alteração de regras de negócio existentes;
- remoção de funcionalidades sem comprovação;
- substituição de componentes funcionais por versões novas;
- criação de tabelas sem verificar as existentes.

---

# 5. PRIMEIRA ETAPA: RADIOGRAFIA DO SISTEMA

Antes de alterar qualquer código execute uma análise completa.

Mapear:

## Estrutura de páginas

Localizar:


app/admin-master/cozinha-chef/


Identificar:

- páginas existentes;
- rotas;
- componentes usados;
- páginas duplicadas;
- versões antigas.

---

## Componentes

Localizar:

- componentes React;
- formulários;
- tabelas;
- cards;
- modais;
- calculadoras.

Classificar:

- ativo;
- duplicado;
- obsoleto;
- necessário.

---

## Hooks

Localizar:

- hooks de receitas;
- estoque;
- produção;
- pedidos;
- financeiro.

Verificar:

- duplicação;
- regras espalhadas;
- chamadas quebradas.

---

## Services

Identificar:

- services existentes;
- funções repetidas;
- lógica duplicada.

---

## APIs

Mapear:


/api/cozinha/


Identificar:

- endpoints existentes;
- consumo;
- retorno;
- dependências.

---

## Banco de dados

Verificar:

- tabelas existentes;
- relacionamentos;
- campos duplicados;
- dados perdidos.

---

# 6. GERAR RELATÓRIO ANTES DE ALTERAR

Antes de modificar qualquer arquivo gerar relatório:


AUDITORIA_COZINHA_CHEF_NEIDE.md


O relatório deve conter:

## 1. Estado atual

O que existe hoje.

## 2. Funcionalidades encontradas

Separar:

- funcionando;
- parcialmente funcionando;
- quebradas;
- ausentes.

## 3. Duplicações encontradas

Exemplo:


Receita antiga

Receita nova

Produto duplicado

Catálogo independente


## 4. Plano mínimo de correção

Indicar:

- arquivo;
- motivo;
- alteração necessária.

Aguardar aprovação antes de grandes mudanças.

---

# 7. PRIORIDADE DE RESTAURAÇÃO

Executar nesta ordem:

---

## PRIORIDADE 1

Restaurar Receita.

Garantir:

- cadastro;
- ingredientes;
- pesos;
- unidades;
- imagens;
- rendimento.

---

## PRIORIDADE 2

Restaurar cálculo.

Garantir:

- custo ingrediente;
- custo receita;
- custo por porção;
- margem;
- lucro;
- preço sugerido.

---

## PRIORIDADE 3

Restaurar integrações.

Receita deve alimentar:

- catálogo;
- cardápio;
- produção;
- estoque;
- compras;
- pedidos;
- financeiro.

---

## PRIORIDADE 4

Restaurar experiência do usuário.

Verificar:

- quantidade de cliques;
- telas desnecessárias;
- informações repetidas;
- fluxos quebrados.

---

# 8. PADRÃO DE EXECUÇÃO

Sempre trabalhar em pequenas entregas.

Cada alteração deve informar:


Arquivo alterado:

Motivo:

Problema resolvido:

Impacto:

Como testar:


---

# 9. ECONOMIA DE TOKENS E PROCESSAMENTO

Para reduzir consumo:

Não analisar todo o projeto novamente a cada tarefa.

Utilizar:

- documentos oficiais;
- relatórios gerados;
- arquivos diretamente relacionados.

Antes de abrir centenas de arquivos:

Identificar primeiro:

- rota;
- componente;
- service;
- API relacionada.

---

# 10. CRITÉRIO PARA ALTERAÇÃO DE CÓDIGO

Só modificar quando responder:

1. Qual problema está sendo corrigido?
2. Qual arquivo é responsável?
3. Existe código existente reutilizável?
4. Essa alteração mantém Receita como fonte única?
5. Pode quebrar outro módulo?

---

# 11. TESTES OBRIGATÓRIOS

Após cada etapa validar:

## Receita

Criar uma receita teste.

Adicionar:

- ingredientes;
- pesos;
- valores.

Confirmar:

- cálculo correto.

---

## Catálogo

Confirmar:

Receita publicada aparece no catálogo.

---

## Produção

Confirmar:

Produção gera consumo.

---

## Estoque

Confirmar:

Movimentação registrada.

---

## Compras

Confirmar:

Falta de ingrediente gera necessidade.

---

## Financeiro

Confirmar:

Venda e custo refletem resultado.

---

# 12. OBJETIVO FINAL

O trabalho estará concluído quando:

Um usuário conseguir:

"Criar uma nova marmita"

em um único fluxo:


Receita

↓

Ingredientes

↓

Custos

↓

Preço

↓

Imagem

↓

Publicação

↓

Venda

↓

Produção

↓

Estoque

↓

Compras

↓

Lucro


Sem cadastrar a mesma informação duas vezes.

---

# 13. INSTRUÇÃO FINAL AO AGENTE

Você não está criando um novo módulo.

Você está recuperando e fortalecendo um sistema existente.

Priorize:

- preservar funcionalidades;
- reaproveitar código;
- eliminar duplicações;
- restaurar o fluxo original;
- melhorar a experiência do usuário.

A melhor solução é a mais simples que mantém a arquitetura definida.

Fim do prompt.