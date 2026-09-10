-- Caminho: supabase/migrations/109_fila_saude_agendamento_pagamento.sql
--
-- Duas peças que faltavam na Fila Virtual de Saude (ver proposta "Modo
-- Valente Facil", item 5):
--
-- 1) Agendamento eletivo: o diretor (ou quem ele autorizar) marca uma
--    senha com dias de antecedencia (data_agendada). No dia marcado, ela
--    entra na fila do dia normalmente -- ver mudanca na query de
--    lib/saude/filaQueries.ts.
--
-- 2) Pagamento: forma escolhida no agendamento (cartao/pix pagam na hora
--    via Mercado Pago -- reaproveita o que ja existe em carona/agua-gas;
--    dinheiro fica "aguardando" ate' a unidade confirmar, com a comissao
--    configuravel em unidade_saude_config.comissao_pagamento_dinheiro_pct).

alter table fila_saude_senhas add column if not exists data_agendada date;
alter table fila_saude_senhas add column if not exists agendado_por uuid references usuarios(id);
alter table fila_saude_senhas add column if not exists forma_pagamento text check (forma_pagamento in ('cartao_pix', 'dinheiro'));
alter table fila_saude_senhas add column if not exists status_pagamento text not null default 'nao_aplicavel' check (status_pagamento in ('nao_aplicavel', 'pago', 'aguardando', 'repassado'));
alter table fila_saude_senhas add column if not exists valor_pagamento numeric(10,2);

create index if not exists idx_fila_saude_senhas_data_agendada on fila_saude_senhas(unidade_id, data_agendada) where data_agendada is not null;
