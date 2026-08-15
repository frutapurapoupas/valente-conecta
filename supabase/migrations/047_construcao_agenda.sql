-- Caminho: C:\valente_conecta\supabase\migrations\047_construcao_agenda.sql
--
-- Agenda de 60 dias pros prestadores de construcao civil (pedido do dono
-- do projeto): o profissional marca no catalogo dele quais dias dos
-- proximos 60 estao ocupados; o usuario escolhe um dia livre e solicita;
-- o profissional recebe notificacao e pode aceitar ou recusar; aceitando,
-- o dia vira ocupado automaticamente e o solicitante e' avisado.
--
-- dono_id e solicitante_id SEM FK pra usuarios de proposito — este modulo
-- (arquetipo "anuncio-contato": servicos/imoveis/emprego/construcao) usa
-- obterUsuarioLocalId() como identidade, o mesmo id ja usado em
-- catalogo_itens.dono_id e no fluxo de interesse (ver
-- components/catalogo/InteresseButton.tsx) — nao o cadastro real
-- (usuarios.id) usado em PDV/Carona/Fiado. Manter consistente com o resto
-- do modulo em vez de inventar uma segunda identidade so' pra agenda.

create table if not exists construcao_agenda_dias (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  data date not null,
  created_at timestamptz not null default now(),
  unique (dono_id, data)
);
-- Presenca de uma linha = dia ocupado. Ausencia = dia livre (nao precisa
-- pre-popular os 60 dias, so marcar excecao).

create index if not exists idx_construcao_agenda_dias_dono on construcao_agenda_dias(dono_id);

create table if not exists construcao_agenda_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid not null,
  solicitante_id uuid not null,
  solicitante_nome text not null,
  solicitante_telefone text not null,
  data date not null,
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'recusado')),
  created_at timestamptz not null default now(),
  respondido_em timestamptz
);

create index if not exists idx_construcao_agenda_sol_dono on construcao_agenda_solicitacoes(dono_id);
create index if not exists idx_construcao_agenda_sol_solicitante on construcao_agenda_solicitacoes(solicitante_id);

alter table construcao_agenda_dias enable row level security;
alter table construcao_agenda_solicitacoes enable row level security;
create policy "construcao_agenda_dias_publica" on construcao_agenda_dias for all using (true) with check (true);
create policy "construcao_agenda_sol_publica" on construcao_agenda_solicitacoes for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
