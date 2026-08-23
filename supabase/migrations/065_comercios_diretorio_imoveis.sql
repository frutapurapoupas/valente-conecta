-- Caminho: C:\valente_conecta\supabase\migrations\065_comercios_diretorio_imoveis.sql
--
-- Adiciona 'imoveis' aos modulos validos de comercios_diretorio (056).
-- Cobre so' imobiliarias encontradas via Google Places (real_estate_agency)
-- -- diferente de app/imoveis/page.tsx, que e' o marketplace de anuncios de
-- imovel em si (venda/aluguel por proprietario/corretor), sistema separado
-- e nao afetado por isso. Mesmo padrao "Sou proprietário" dos outros
-- modulos pra imobiliaria reivindicar o proprio cadastro depois.

-- Acha e derruba o check constraint da coluna modulo dinamicamente (nao
-- foi nomeado explicitamente na migration 056, entao o nome exato que o
-- Postgres gerou pode variar) antes de recriar com 'imoveis' incluido.
do $$
declare
  v_nome_constraint text;
begin
  select con.conname into v_nome_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'comercios_diretorio'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%modulo%';

  if v_nome_constraint is not null then
    execute format('alter table comercios_diretorio drop constraint %I', v_nome_constraint);
  end if;
end $$;

alter table comercios_diretorio add constraint comercios_diretorio_modulo_check
  check (modulo in ('alimentacao', 'mercados', 'moda', 'pet', 'construcao', 'servicos', 'imoveis'));
