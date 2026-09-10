-- Caminho: supabase/migrations/105_servicos_tipo_profissional_empresa.sql
--
-- Unificacao de "Profissionais" + "Servicos" num modulo so' (ver proposta
-- "Modo Valente Facil"): em vez de duas tabelas/regras paralelas, o mesmo
-- diretorio (profissionais_diretorio) passa a distinguir profissional
-- autonomo (pedreiro, pintor...) de empresa (cabeleireiro, borracheiro...)
-- por um campo "tipo". Linhas existentes (todas cadastradas como
-- profissional autonomo ate' aqui) ficam com tipo='profissional'.

alter table profissionais_diretorio add column if not exists tipo text not null default 'profissional' check (tipo in ('profissional', 'empresa'));
create index if not exists idx_profissionais_diretorio_tipo on profissionais_diretorio(tipo);
