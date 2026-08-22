-- Caminho: C:\valente_conecta\supabase\migrations\064_pdv_importacao_estoque.sql
--
-- Suporte a importacao de planilha de estoque pelo lojista (publica varios
-- produtos de uma vez no catalogo, em vez de item a item). A unica coisa
-- nova de schema e' o contador diario de consultas a' API externa de foto
-- por EAN (Kodebar) — o resto (catalogo_itens.metadata, pdv_produtos_catalogo)
-- ja' resolve sem alteracao (ver decisao registrada no plano de implementacao).
--
-- O contador e' incrementado de forma atomica direto no banco (nao faz
-- SELECT e depois UPDATE a partir do Node) pra nao ter condicao de corrida
-- se duas linhas da planilha, de importacoes diferentes rodando ao mesmo
-- tempo, tentarem consumir a ultima consulta livre do dia.

create table if not exists pdv_kodebar_contador_diario (
  data date primary key,
  consultas integer not null default 0
);

create or replace function pdv_kodebar_incrementar_contador_v1(p_limite integer)
returns boolean
language plpgsql
as $$
declare
  v_consultas integer;
begin
  insert into pdv_kodebar_contador_diario (data, consultas)
  values (current_date, 1)
  on conflict (data) do update set consultas = pdv_kodebar_contador_diario.consultas + 1
  returning consultas into v_consultas;

  return v_consultas <= p_limite;
end;
$$;

alter table pdv_kodebar_contador_diario enable row level security;
create policy "pdv_kodebar_contador_diario_publica" on pdv_kodebar_contador_diario for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do
-- resto do projeto.
