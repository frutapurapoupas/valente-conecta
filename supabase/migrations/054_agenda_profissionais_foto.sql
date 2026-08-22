-- Caminho: C:\valente_conecta\supabase\migrations\054_agenda_profissionais_foto.sql
--
-- Selfie do profissional (medico/prestador) que atende na fila, pedido do
-- dono do projeto: o proprio profissional envia sua foto (via painel dele,
-- ja autenticado por PIN — ver app/agenda/[donoId]/painel/page.tsx) e ela
-- passa a aparecer pro cliente na hora de escolher quem vai atender
-- (app/agenda/[donoId]/page.tsx), junto do nome e especialidade que ja
-- existiam.

alter table agenda_profissionais add column if not exists foto_url text;

-- View publica precisa ser recriada pra incluir a coluna nova — ela existe
-- justamente pra nunca vazar pin_hash pro cliente (ver 019_agenda_fila.sql).
-- Usa DROP+CREATE (nao CREATE OR REPLACE) porque o Postgres so' deixa
-- REPLACE adicionar coluna no final da lista, nao no meio.
drop view if exists agenda_profissionais_publico;
create view agenda_profissionais_publico as
  select id, dono_id, nome, especialidade, foto_url, ativo, created_at from agenda_profissionais;

grant select on agenda_profissionais_publico to anon, authenticated;

-- login_funcionario_agenda tambem precisa devolver foto_url, senao o painel
-- so' mostra a foto depois de recarregar a pagina (ver 019_agenda_fila.sql).
-- Mesmo motivo do DROP+CREATE acima: mudar a lista de colunas de retorno
-- de uma funcao nao e' permitido via CREATE OR REPLACE.
drop function if exists login_funcionario_agenda(uuid, text);
create function login_funcionario_agenda(p_profissional_id uuid, p_pin text)
returns table (id uuid, nome text, especialidade text, foto_url text, dono_id uuid)
language sql
security definer
set search_path = public, extensions
as $$
  select id, nome, especialidade, foto_url, dono_id
  from agenda_profissionais
  where id = p_profissional_id and ativo = true and pin_hash = crypt(p_pin, pin_hash);
$$;
