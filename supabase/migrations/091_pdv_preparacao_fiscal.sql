-- Caminho: C:\valente_conecta\supabase\migrations\091_pdv_preparacao_fiscal.sql
--
-- Completa a base fiscal deixada pela metade em 045_base_fiscal_pdv.sql
-- (os campos cnpj_cpf/inscricao_estadual/regime_tributario existiam mas
-- nenhuma tela jamais preenchia) e adiciona o que falta pra deixar o PDV
-- PRONTO pra plugar um provedor de NFC-e depois -- sem emitir nada de
-- verdade ainda, sem certificado digital, sem custo. Ver comparativo com
-- o Bling: gap "emissao fiscal real" era o maior encontrado.

-- Endereco estruturado + regime/numeracao fiscal do emissor -- sem isso,
-- NENHUM provedor de NFC-e consegue emitir, seja qual for escolhido depois.
alter table perfis_fornecedor add column if not exists endereco_logradouro text;
alter table perfis_fornecedor add column if not exists endereco_numero text;
alter table perfis_fornecedor add column if not exists endereco_complemento text;
alter table perfis_fornecedor add column if not exists endereco_bairro text;
alter table perfis_fornecedor add column if not exists endereco_municipio text;
alter table perfis_fornecedor add column if not exists endereco_codigo_ibge text;
alter table perfis_fornecedor add column if not exists endereco_uf text;
alter table perfis_fornecedor add column if not exists endereco_cep text;
alter table perfis_fornecedor add column if not exists crt integer check (crt in (1,2,3)); -- Codigo de Regime Tributario (SEFAZ): 1=Simples Nacional, 2=Simples excesso sublimite, 3=Regime normal
alter table perfis_fornecedor add column if not exists serie_nfce text not null default '1';
alter table perfis_fornecedor add column if not exists proximo_numero_nfce integer not null default 1;

-- Classificacao fiscal do produto (por EAN/SKU, catalogo colaborativo --
-- um produto so' tem uma classificacao, nao duplica por comerciante).
alter table pdv_produtos_catalogo add column if not exists ncm text;
alter table pdv_produtos_catalogo add column if not exists cfop_padrao text default '5102';
alter table pdv_produtos_catalogo add column if not exists cst_csosn text;
alter table pdv_produtos_catalogo add column if not exists origem_mercadoria text default '0';

-- Campos que a nota emitida de VERDADE vai preencher quando a integracao
-- existir -- hoje ficam null, o controle manual continua exatamente igual.
alter table pdv_notas_fiscais add column if not exists chave_acesso text;
alter table pdv_notas_fiscais add column if not exists protocolo_autorizacao text;
alter table pdv_notas_fiscais add column if not exists xml_url text;
alter table pdv_notas_fiscais add column if not exists danfe_url text;
alter table pdv_notas_fiscais add column if not exists ambiente text not null default 'homologacao' check (ambiente in ('homologacao','producao'));

alter table pdv_vendas add column if not exists nota_fiscal_id uuid references pdv_notas_fiscais(id);

-- v4 da RPC de perfil do fornecedor: inclui os campos novos + os que a v3
-- ja aceitava mas nenhuma tela nunca preenchia (cnpj_cpf/inscricao_estadual/
-- regime_tributario) -- nome novo por causa do cache do pooler de conexoes
-- (ver nota de versionamento em 003_marketplace_interesse.sql).
create or replace function salvar_perfil_fornecedor_v4(
  p_usuario_id uuid,
  p_nome_exibicao text,
  p_telefone text,
  p_whatsapp text default null,
  p_endereco text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_plano text default 'gratis',
  p_horarios jsonb default null,
  p_cnpj_cpf text default null,
  p_inscricao_estadual text default null,
  p_regime_tributario text default null,
  p_crt integer default null,
  p_endereco_logradouro text default null,
  p_endereco_numero text default null,
  p_endereco_complemento text default null,
  p_endereco_bairro text default null,
  p_endereco_municipio text default null,
  p_endereco_codigo_ibge text default null,
  p_endereco_uf text default null,
  p_endereco_cep text default null,
  p_categoria_negocio text default null
)
returns perfis_fornecedor
language sql
security definer
set search_path = public
as $$
  insert into perfis_fornecedor (
    usuario_id, nome_exibicao, telefone, whatsapp, endereco, latitude, longitude, plano, horarios,
    cnpj_cpf, inscricao_estadual, regime_tributario, crt,
    endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro,
    endereco_municipio, endereco_codigo_ibge, endereco_uf, endereco_cep, categoria_negocio, updated_at
  )
  values (
    p_usuario_id, p_nome_exibicao, p_telefone, p_whatsapp, p_endereco, p_latitude, p_longitude, p_plano, p_horarios,
    p_cnpj_cpf, p_inscricao_estadual, p_regime_tributario, p_crt,
    p_endereco_logradouro, p_endereco_numero, p_endereco_complemento, p_endereco_bairro,
    p_endereco_municipio, p_endereco_codigo_ibge, p_endereco_uf, p_endereco_cep, p_categoria_negocio, now()
  )
  on conflict (usuario_id) do update set
    nome_exibicao = excluded.nome_exibicao,
    telefone = excluded.telefone,
    whatsapp = excluded.whatsapp,
    endereco = excluded.endereco,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    plano = excluded.plano,
    horarios = excluded.horarios,
    cnpj_cpf = excluded.cnpj_cpf,
    inscricao_estadual = excluded.inscricao_estadual,
    regime_tributario = excluded.regime_tributario,
    crt = excluded.crt,
    endereco_logradouro = excluded.endereco_logradouro,
    endereco_numero = excluded.endereco_numero,
    endereco_complemento = excluded.endereco_complemento,
    endereco_bairro = excluded.endereco_bairro,
    endereco_municipio = excluded.endereco_municipio,
    endereco_codigo_ibge = excluded.endereco_codigo_ibge,
    endereco_uf = excluded.endereco_uf,
    endereco_cep = excluded.endereco_cep,
    categoria_negocio = excluded.categoria_negocio,
    updated_at = now()
  returning *;
$$;
