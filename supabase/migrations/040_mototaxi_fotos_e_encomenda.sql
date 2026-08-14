-- Caminho: C:\valente_conecta\supabase\migrations\040_mototaxi_fotos_e_encomenda.sql
--
-- Dois pedidos do dono do projeto pro modulo Moto Taxi:
--
-- 1) FOTOS REAIS DO MOTORISTA — antes so existia "foto_url", um campo de
--    URL de texto livre e OPCIONAL (o motorista colava um link, sem
--    validacao nenhuma) e nenhum campo pra foto do veiculo ou da CNH —
--    so' um numero de CNH e dois checkboxes de autodeclaracao
--    (cnh_valida / documento_veiculo_ok). Agora existe upload de verdade
--    (MidiaUploader, mesmo padrao do catalogo colaborativo do PDV) pras
--    3 fotos, e as 3 passam a ser obrigatorias no cadastro (reforcado em
--    validarMotoristaPayload, ver app/api/mototaxi/route.ts). foto_url
--    continua sendo a foto do ROSTO do motorista (era essa a intencao
--    original do campo) — so' ganhou obrigatoriedade real. As colunas
--    ficam nullable no banco pra nao quebrar motoristas ja cadastrados
--    antes dessa mudanca; a obrigatoriedade e' aplicada na API pra
--    cadastro novo.
--
-- 2) TIPO DE CORRIDA (passageiro / encomenda) — a home agora oferece 2
--    cards ao entrar no Moto Taxi: "Passageiro" e "Encomenda pequena".
--    Reaproveita a MESMA tabela e o MESMO motor de match/aceite/GPS que
--    ja existia pra passageiro (o pedido do dono do projeto foi
--    explicito: "o restante ja esta desenhado") — so precisa saber se a
--    corrida e' de gente ou de pacote, e guardar quem recebe a encomenda.

alter table mototaxi_motoristas
  add column if not exists veiculo_foto_url text,
  add column if not exists cnh_foto_url text;

alter table mototaxi_corridas
  add column if not exists tipo text not null default 'passageiro' check (tipo in ('passageiro', 'encomenda')),
  add column if not exists encomenda_descricao text,
  add column if not exists destinatario_nome text,
  add column if not exists destinatario_telefone text;

create index if not exists idx_mototaxi_corridas_tipo on mototaxi_corridas(tipo);
