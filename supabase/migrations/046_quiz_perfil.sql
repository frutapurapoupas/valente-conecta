-- Caminho: C:\valente_conecta\supabase\migrations\046_quiz_perfil.sql
--
-- Quiz adaptativo de perfil, mostrado uma vez pro usuario logo apos o
-- cadastro (pedido do dono do projeto: funil de perguntas que se adequa
-- conforme a resposta anterior, sem constranger, pra descobrir se e'
-- prestador de servico, dono de loja, ou publico geral, e o que mais usaria
-- na plataforma). Uma linha por usuario — o quiz so' aparece uma vez.

create table if not exists perfil_quiz_respostas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios(id) on delete cascade,
  segmento_principal text not null check (segmento_principal in ('servico', 'produto', 'geral')),
  subsegmento text,
  respostas jsonb not null default '{}',
  concluido_em timestamptz not null default now()
);

alter table perfil_quiz_respostas enable row level security;
create policy "perfil_quiz_respostas_publica" on perfil_quiz_respostas for all using (true) with check (true);
-- NOTA DE SEGURANCA: politica temporaria (sem login real), mesmo padrao do resto do projeto.
