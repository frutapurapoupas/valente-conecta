-- Caminho: C:\valente_conecta\supabase\migrations\016_agua_gas_sem_fk_usuarios.sql
--
-- 014_agua_gas_supabase.sql referenciou dono_id/cliente_id -> usuarios(id).
-- Erro: o id "local" gerado no navegador (lib/usuarioLocal.ts), usado em
-- TODO o resto do catalogo (catalogo_itens.dono_id, interesses.comprador_id
-- etc, todos sem FK de proposito), so' vira uma linha real em `usuarios`
-- quando a pessoa passa pelo cadastro nome+whatsapp (cadastroSimples). Ate'
-- la', a FK quebra a criacao de fornecedor. Remove a FK pra usar o mesmo
-- padrao "uuid livre, sem FK" do resto do projeto.

alter table agua_gas_fornecedores drop constraint if exists agua_gas_fornecedores_dono_id_fkey;
alter table agua_gas_pedidos drop constraint if exists agua_gas_pedidos_cliente_id_fkey;
