-- Caminho: C:\valente_conecta\supabase\migrations\043_nome_fornecedor_publico.sql
--
-- RPC dedicada pra devolver so' o nome de exibicao de um ou mais
-- fornecedores, sem vazar telefone/endereco (mesmo espirito da
-- horario_publico_fornecedor_v1 na migration 042). Usada pela tela do
-- cliente de fiado (/meu-fiado): o cliente ja tem uma relacao real com a
-- loja (comprou fiado la' pessoalmente, ver fiado_clientes.cliente_usuario_id
-- na migration 017), entao mostrar o NOME da loja no historico dele nao e'
-- o mesmo "vazamento de contato" que o modelo de marketplace protege.

create or replace function nomes_fornecedores_publico_v1(p_usuario_ids uuid[])
returns table(usuario_id uuid, nome_exibicao text)
language sql
security definer
set search_path = public
as $$
  select usuario_id, nome_exibicao from perfis_fornecedor where usuario_id = any(p_usuario_ids);
$$;
