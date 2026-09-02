-- Caminho: C:\valente_conecta\supabase\migrations\094_validacao_proprietario_loja.sql
--
-- Antes de um lojista poder aprovar/recusar cadastros de produto feitos por
-- CONSUMIDORES (093_cadastro_consumidor_produto.sql), ele precisa provar
-- que e' mesmo dono/responsavel pela loja -- envia um documento
-- comprobatorio (foto) que o admin master revisa e aprova/recusa. So'
-- depois de "aprovado" o lojista consegue dar "de acordo" nos itens
-- cadastrados por clientes (gate aplicado no PUT de
-- /api/pdv/aprovacoes-consumidor). Mesmo padrao de moderacao manual usado
-- em todo o resto do app (nunca validacao automatica/OCR).

alter table perfis_fornecedor add column if not exists documento_comprobatorio_path text;
alter table perfis_fornecedor add column if not exists validacao_status text not null default 'nao_enviado'
  check (validacao_status in ('nao_enviado', 'pendente', 'aprovado', 'recusado'));
alter table perfis_fornecedor add column if not exists validacao_motivo_recusa text;
alter table perfis_fornecedor add column if not exists validado_por uuid references usuarios(id);
alter table perfis_fornecedor add column if not exists validado_em timestamptz;

-- Declaracao de veracidade (falsidade ideologica) que o lojista confirma no
-- MOMENTO de cada envio de documento -- reafirmada a cada reenvio (nao e'
-- um aceite versionado em cache tipo lib/politicaConteudo.ts, porque aqui
-- cada submissao de documento e' um ato juridico proprio).
alter table perfis_fornecedor add column if not exists aceitou_termos_documento_em timestamptz;

create index if not exists idx_perfis_fornecedor_validacao_status on perfis_fornecedor(validacao_status);
