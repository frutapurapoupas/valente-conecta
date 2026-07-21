# COZINHA CHEF NEIDE
# FILOSOFIA DO MÓDULO

Versão: 1.0  
Projeto: Valente Conecta  
Módulo: Cozinha Chef Neide  

---

# 1. PROPÓSITO DESTE DOCUMENTO

Este documento define a filosofia, princípios e visão de produto do módulo Cozinha Chef Neide.

Ele não descreve código.

Ele define:

- por que o módulo existe;
- qual problema ele resolve;
- qual experiência o usuário deve ter;
- quais decisões nunca devem ser quebradas;
- qual deve ser a visão seguida por qualquer desenvolvedor ou agente de inteligência artificial que altere o sistema.

Este documento é a fonte principal de entendimento do módulo.

---

# 2. VISÃO GERAL

O módulo Cozinha Chef Neide não deve ser tratado como um simples cadastro de receitas.

Ele é um sistema de gestão de produção alimentar.

Seu objetivo é permitir que uma cozinha profissional ou artesanal consiga controlar:

- criação de receitas;
- cálculo de custos;
- formação de preço;
- produção;
- estoque;
- compras;
- catálogo público;
- pedidos;
- indicadores financeiros.

O princípio fundamental é:

> Uma receita cadastrada corretamente deve alimentar automaticamente todo o ecossistema da cozinha.

---

# 3. PRINCÍPIO CENTRAL

## RECEITA É A FONTE ÚNICA DA VERDADE

A arquitetura do módulo deve seguir este conceito:
             RECEITA

                |

    -------------------------

    |          |            |
    |

    |

Produção

    |

    |

Estoque

    |

    |

Compras


    |

    |

Catálogo

    |

    |

Pedidos

    |

    |

Financeiro

A receita é o núcleo.

Os demais módulos são consumidores das informações da receita.

---

# 4. PROBLEMA QUE O MÓDULO RESOLVE

Pequenas cozinhas normalmente possuem vários controles separados:

- uma planilha para receitas;
- outra para compras;
- outra para estoque;
- outra para preços;
- outra para vendas.

Isso gera:

- informações duplicadas;
- erros de cálculo;
- preços desatualizados;
- desperdício;
- dificuldade para saber o lucro real.

O Cozinha Chef Neide elimina esse problema criando uma única base integrada.

---

# 5. EXPERIÊNCIA IDEAL DO USUÁRIO

O usuário deve pensar:

"Vou criar uma nova marmita."

Ele não deve pensar:

"Preciso cadastrar produto, depois receita, depois estoque, depois preço, depois catálogo."

O fluxo correto é:


---

# 6. O QUE UMA RECEITA REPRESENTA

Uma receita não é apenas uma lista de ingredientes.

Ela representa:

- um produto vendável;
- uma ficha técnica;
- um cálculo financeiro;
- uma ordem de produção;
- uma informação comercial.

Exemplo:

"Marmita de Carne de Panela"

Possui:

## Informações básicas

- nome;
- descrição;
- categoria;
- imagem;
- status.

## Ingredientes

- carne;
- arroz;
- feijão;
- temperos;
- embalagem.

## Dados técnicos

- peso bruto;
- peso final;
- rendimento;
- quantidade produzida.

## Dados financeiros

- custo total;
- custo unitário;
- margem;
- lucro;
- preço sugerido.

## Dados comerciais

- disponível no catálogo;
- disponível no cardápio;
- disponível para pedidos.

---

# 7. REGRA DE NÃO DUPLICAÇÃO

Nenhuma informação crítica deve existir em dois lugares diferentes.

Não deve existir:

❌ Receita com um preço

e

❌ Produto com outro preço


Não deve existir:

❌ Ingrediente cadastrado na receita

e

❌ Ingrediente independente no estoque sem relação


Não deve existir:

❌ Foto no catálogo

e

❌ Foto diferente na receita


A informação deve nascer uma vez e ser reutilizada.

---

# 8. FILOSOFIA DOS MÓDULOS

## Receita

Responsável por criar e definir o produto.

---

## Estoque

Não cria produtos.

Ele controla os ingredientes utilizados pelas receitas.

---

## Compras

Não cadastra necessidades manualmente.

Ele identifica faltas baseado na produção planejada.

---

## Produção

Não cria produtos.

Ela executa receitas.

---

## Catálogo

Não possui cadastro próprio.

Ele publica receitas autorizadas.

---

## Pedidos

Não controla produtos independentes.

Ele vende itens originados das receitas.

---

## Financeiro

Não calcula valores isolados.

Ele recebe informações geradas pelo processo produtivo.

---

# 9. PRINCÍPIO ERP

O módulo deve funcionar como um pequeno ERP alimentar.

A sequência natural é:

---

# 10. OBJETIVO FINAL

Transformar uma cozinha artesanal em uma operação profissional.

O usuário deve conseguir responder:

- Quanto custa produzir?
- Quanto estou lucrando?
- Quanto preciso comprar?
- Quanto devo produzir?
- Qual produto vende mais?
- Qual receita dá mais margem?
- Quanto estoque tenho?
- Qual preço devo cobrar?

Sem planilhas externas.

Sem retrabalho.

Sem duplicação.

---

# 11. PRINCÍPIO PARA INTELIGÊNCIAS ARTIFICIAIS

Qualquer agente que alterar este módulo deve compreender:

O objetivo não é criar telas.

O objetivo é preservar o fluxo operacional.

Antes de modificar qualquer código, a IA deve perguntar:

"Esta alteração fortalece a Receita como fonte única da verdade?"

Se a resposta for não, a alteração deve ser reconsiderada.

---

# 12. REGRA FINAL

O módulo Cozinha Chef Neide deve sempre evoluir seguindo:

A melhor implementação é aquela onde o usuário cadastra uma receita e o sistema trabalha para ele.
