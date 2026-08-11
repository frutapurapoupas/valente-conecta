-- Suporte a push notifications para alunos e geolocalizacao da unidade,
-- para os fluxos de: aviso de cobranca, lembrete de frequencia semanal e
-- check-in por proximidade (ver app/academia/empresa e app/academia/aluno).

alter table academia_alunos
  add column if not exists push_subscription jsonb;

alter table gym_units
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
