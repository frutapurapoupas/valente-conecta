# RELATORIO_MAPEAMENTO_LEGADO_COZINHA

Status: diagnostico somente.
Escopo desta fase: nao mover, nao deletar, nao alterar codigo.
Base de evidencia: estrutura atual do workspace + grafo de imports/usos atuais.

## GRUPO A - Codigo ativo obrigatorio

| Caminho | Funcao | Quem importa/utiliza | Risco de remocao | Recomendacao |
|---|---|---|---|---|
| app/admin-master/cozinha-chef/receitas/page.tsx | Lista oficial de receitas no Admin Master Cozinha Chef | Rota Next.js /admin-master/cozinha-chef/receitas | Alto (quebra listagem e navegacao de CRUD) | Manter como fluxo oficial |
| app/admin-master/cozinha-chef/receitas/novo/page.tsx | Criacao oficial de receita canonica | Rota Next.js /admin-master/cozinha-chef/receitas/novo; usa hook oficial useReceita | Alto (quebra criacao) | Manter |
| app/admin-master/cozinha-chef/receitas/editar/[id]/page.tsx | Edicao oficial de receita canonica | Rota Next.js /admin-master/cozinha-chef/receitas/editar/[id]; usa hook oficial useReceita | Alto (quebra edicao) | Manter |
| app/admin-master/cozinha-chef/receitas/_components/ReceitaFormularioCanonico.tsx | Formulario compartilhado entre novo/editar | Importado por receitas/novo/page.tsx e receitas/editar/[id]/page.tsx | Alto (duplicacao/ruptura do CRUD) | Manter como componente unico |
| app/admin-master/cozinha-chef/hooks/useReceita.ts | Orquestracao principal de leitura/escrita canonica de receita | Importado por receitas/novo/page.tsx e receitas/editar/[id]/page.tsx | Alto (quebra ciclo GET/POST/PUT/DELETE de receita) | Manter como hook oficial |
| app/admin-master/cozinha-chef/services/custoService.ts | Regras centrais de normalizacao e calculo financeiro de receita | Importado por hooks/useReceita.ts, hooks/useEditarReceita.ts, receitas/novo/page.tsx, receitas/editar/[id]/page.tsx, app/admin-master/cozinha/repositories/ReceitaRepository.ts | Alto (inconsistencia de contrato/calculo) | Manter como nucleo de regra unica |
| app/api/cozinha/receitas/route.ts | Endpoint oficial canonico de receitas (GET/POST/PUT/DELETE por query id) | Consumido por hooks/useReceita.ts e receitas/page.tsx | Alto (quebra backend oficial do CRUD) | Manter |
| app/api/cozinha/receitas/[id]/route.ts | Endpoint oficial canonico por id (GET/PUT/DELETE) | Consumido por hooks/useReceita.ts | Alto | Manter |
| app/api/cozinha/receitas/canonical.ts | Traducao Canonico <-> DB para receitas | Importado por app/api/cozinha/receitas/route.ts e app/api/cozinha/receitas/[id]/route.ts; reaproveitado em recipes compat | Alto (quebra de contrato e serializacao) | Manter |
| app/api/cozinha/recipes/route.ts | Endpoint de compatibilidade legada retornando formato canonico | Consumido por hooks/useReceita.ts, hooks/useCatalogo.ts, hooks/useCardapio.ts, preview/page.tsx | Medio/alto (quebra fluxos de fallback e catalogo) | Manter ate descomissionamento planejado |
| types/receita-canonica.ts | Contrato canonico tipado da receita | Importado por paginas/hooks/apis oficiais de receita | Alto | Manter como contrato fonte |

## GRUPO B - Codigo usado parcialmente

| Caminho | Funcao | Quem importa/utiliza | Risco de remocao | Recomendacao |
|---|---|---|---|---|
| app/admin-master/cozinha-chef/hooks/useCatalogo.ts | Monta catalogo publico combinando cardapio + recipes + fallbacks | Importado por app/cozinha/catalogo/page.tsx | Medio (impacta catalogo publico) | Manter temporariamente; reduzir dependencias legadas e corrigir encoding depois da aprovacao |
| hooks/useCardapio.ts | Hook global de cardapio com create/delete/reload | Importado por app/admin-master/cozinha-chef/preview/page.tsx e app/cozinha/cardapio/page.tsx | Medio (preview e cardapio publico perdem integracao) | Manter por ora; convergir para endpoint/cardapio completo antes de limpeza |
| app/api/cozinha/cardapio/route.ts | API de cardapio (atualmente GET) | Consumido por hooks/useCardapio.ts e hooks/useCatalogo.ts | Medio (fluxo de leitura funciona; escrita fica parcial) | Manter; planejar extensao de POST/DELETE ou ajuste de consumidores |
| app/api/cozinha/estoque/route.ts e app/api/cozinha/estoque/[id]/route.ts | CRUD estoque via API | Consumido por hooks/useReceita.ts e servicos/hook de estoque | Medio | Manter |
| app/api/cozinha/financeiro/route.ts e app/api/cozinha/financeiro/[id]/route.ts | CRUD financeiro via API | Consumido por servicos de financeiro | Medio | Manter |
| services/cozinhaService.ts | Fachada legada para varios endpoints /api/cozinha | Importado por hooks/useCatalogo.ts, hooks/useEditarReceita.ts, hooks/useMovimentacoes.ts, components/admin/FormularioReceita.tsx | Medio/alto (parte dos metodos e usada, parte aponta para endpoints inexistentes) | Manter durante transicao; depois quebrar em servicos por dominio e remover metodos sem endpoint |
| app/admin-master/cozinha-chef/compras/page.tsx | Tela ativa de compras e aprovacao de solicitacoes | Rota Next.js /admin-master/cozinha-chef/compras; usa hooks useCompras + useComprasRequests | Medio | Manter; validar consistencia com tabela compras_requests |
| app/admin-master/cozinha-chef/pratos/page.tsx | Tela ativa de pratos | Rota Next.js /admin-master/cozinha-chef/pratos; usa hook usePratos | Medio | Manter; alinhar contrato de tabela pratos |
| app/admin-master/cozinha-chef/producao/page.tsx | Tela ativa de producao | Rota Next.js /admin-master/cozinha-chef/producao; usa hook useProducao | Medio | Manter |
| app/admin-master/cozinha-chef/pedidos/page.tsx | Tela ativa de pedidos com dados de dashboard | Rota Next.js /admin-master/cozinha-chef/pedidos; usa hook useDashboard | Medio | Manter; revisar origem de dados apos aprovacao |
| app/admin-master/cozinha-chef/movimentacoes/page.tsx | Tela ativa de movimentacao com fallback localStorage | Rota Next.js /admin-master/cozinha-chef/movimentacoes; usa /api/cozinha/stock-movements (inexistente em app/api atual) | Medio/alto (funciona com fallback local, sem persistencia robusta) | Manter temporariamente; unificar em endpoint oficial antes de limpeza |
| app/admin-master/cozinha/page.tsx e app/admin-master/cozinha/receitas/page.tsx | Modulo admin paralelo/antigo ainda roteavel | Rotas /admin-master/cozinha*; usam src/modules/cozinha/hooks/useReceitas | Medio (duas entradas administrativas para cozinha) | Manter por enquanto; decidir modulo oficial unico na fase de aprovacao |
| src/modules/cozinha/** | Camada modular antiga (hooks/services/repos/types) usada pelo admin paralelo | Importado por app/admin-master/cozinha/page.tsx, app/admin-master/cozinha/receitas/page.tsx e app/api/produtos/route.ts | Medio | Manter ate decisao de consolidacao; mapear ponto a ponto antes de desativar |

## GRUPO C - Codigo legado confirmado

| Caminho | Funcao | Quem importa/utiliza | Risco de remocao | Recomendacao |
|---|---|---|---|---|
| app/admin-master/cozinha-chef/hooks/useEditarReceita.ts | Hook legado de edicao via cozinhaService (metodos antigos) | Nenhuma pagina oficial atual usa este hook (fluxo oficial usa hooks/useReceita.ts) | Baixo/medio | Candidato a desativacao controlada apos aprovacao |
| hooks/useEditarReceita.ts | Hook global legado de edicao (getRecipeById/updateRecipe) | Sem uso ativo identificado nas paginas atuais | Baixo | Candidato a remocao apos janela de seguranca |
| app/admin-master/cozinha-chef/hooks/useMovimentacoes.ts | Hook legado para stock movements via cozinhaService.getStockMovements | Sem consumo ativo pelas paginas atuais do modulo chef | Baixo | Candidato a remocao apos aprovacao |
| hooks/useMovimentacoes.ts | Duplicata global legada de movimentacoes | Sem consumo ativo identificado nas paginas atuais | Baixo | Candidato a remocao apos aprovacao |
| app/admin-master/cozinha-chef/useDashboardCozinha.ts | Hook legado de dashboard financeiro por /api/cozinha/pratos | Sem import ativo identificado | Baixo | Candidato a arquivamento/remocao |
| app/admin-master/cozinha-chef/hooks/useFinanceiro.ts | Hook legado de financeiro baseado em financeiroService | Sem uso atual detectado nas pages do modulo chef | Baixo/medio | Candidato a desativacao controlada |
| app/admin-master/cozinha-chef/hooks/useFinanceiroPessoal.ts | Derivacao de hook financeiro legado | Sem uso atual detectado | Baixo | Candidato a remocao |
| app/api/cozinha/compras, app/api/cozinha/compras-requests, app/api/cozinha/pratos, app/api/cozinha/producao, app/api/cozinha/pedidos, app/api/cozinha/stock-movements, app/api/cozinha/ingredients, app/api/cozinha/fornecedores, app/api/cozinha/recipe-items, app/api/cozinha/upload | Diretorios vazios (sem route.ts atual) de endpoints antigos | Referenciados por parte do codigo legado/parcial, mas sem implementacao ativa atual | Medio (pode quebrar fallbacks legados se limpeza for abrupta) | Nao remover nesta fase; mapear consumidores e decidir em lote na fase aprovada |
| app/admin-master/cozinha/repositories/ReceitaRepository.ts | Repositorio legado de receitas cozinha_* | Sem consumo direto identificado no fluxo oficial de receita | Baixo/medio | Manter congelado; avaliar substituicao total pelo fluxo canonico |

## GRUPO D - Backup historico

| Caminho | Funcao | Quem importa/utiliza | Risco de remocao | Recomendacao |
|---|---|---|---|---|
| backup_routes_2026-07-16_09-48/** | Snapshot historico de rotas API antigas da cozinha | Nao importado no runtime atual | Baixo no runtime; medio para rastreabilidade | Manter como backup ate aprovacao formal; nao mesclar automaticamente |
| backup_modulos_2026-07-16_09-43/** | Snapshot historico de modulos antigos | Nao importado no runtime atual | Baixo no runtime | Manter como evidencia historica ate aprovacao |
| backup_consolidacao_cozinha_2026-07-20_12-42/** | Backup manual de consolidacao | Nao importado no runtime atual | Baixo no runtime | Manter temporariamente; apto a arquivamento externo apos aprovacao |
| backup_20260620_224213/** e backup_corrompidos_2026-07-20_09-06/** | Backups gerais/recuperacao | Nao importado no runtime atual | Baixo no runtime | Manter ate confirmar rollback desnecessario |
| auditoria_*/**, auditoria_arquitetura_geral/**, auditoria_definitiva/**, auditoria_erp/**, auditoria_ui_logica/**, auditoria_completa/**, AUDITORIA_COZINHA/** | Artefatos de auditoria e diagnostico historico | Nao importados no runtime; usados apenas como consulta | Baixo no runtime; medio documental | Manter como historico de decisao; nao usar como fonte unica de verdade sem validar estado atual |

## Observacoes de conflito de legado

- Existe convivio de dois eixos administrativos de cozinha: app/admin-master/cozinha-chef e app/admin-master/cozinha.
- Existem hooks/servicos ativos em modo parcial, com fallback localStorage ou chamadas para endpoints hoje sem route.ts.
- O fluxo oficial de Receita canonica esta concentrado em app/admin-master/cozinha-chef/receitas + app/api/cozinha/receitas + custoService/canonical.

## Recomendacao operacional desta fase

- Nao executar limpeza estrutural agora.
- Aguardar aprovacao explicita para fase de movimentacao/remocao.
- Na fase seguinte aprovada, executar plano em lote por grupo (C depois D), com checklist de regressao por rota e endpoint.
