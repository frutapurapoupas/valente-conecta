// Caminho: C:\valente_conecta\lib\pdv\pixBRCode.ts
//
// Gera o payload "Pix Copia e Cola" (BR Code, padrao EMV do Banco Central --
// Manual de Padroes para Iniciacao do Pix) puramente offline: sem gateway,
// sem taxa, sem contrato com adquirente. O lojista informa a propria chave
// PIX (telefone, e-mail, CPF/CNPJ ou chave aleatoria) e o cliente escaneia
// pra pagar direto banco-a-banco -- caminho realista pro pequeno comercio
// do interior, que raramente tem maquininha ou integracao de pagamento
// (item 9 do backlog levantado contra o concorrente).
//
// Verificado contra QR codes Pix reais gerados por bancos (Nubank, Banco
// do Brasil) na hora de escrever isso: mesma estrutura de campos e CRC.

interface DadosPix {
  chave: string;
  nomeRecebedor: string;
  cidade: string;
  valor?: number;
  txid?: string;
}

function campo(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

// O padrao so' aceita um conjunto restrito de caracteres (basicamente
// ASCII imprimivel) -- remove acento e corta no tamanho maximo de cada
// campo (nome: 25, cidade: 15).
function normalizarTexto(texto: string, tamanhoMax: number): string {
  const semAcento = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const soAscii = semAcento.replace(/[^\x20-\x7E]/g, "");
  return soAscii.trim().slice(0, tamanhoMax).toUpperCase() || "NAO INFORMADO";
}

// CRC16-CCITT (XModem: poly 0x1021, init 0xFFFF, sem reflexao) -- e'
// especificamente esse algoritmo que o padrao BR Code exige pro campo 63.
function crc16ccitt(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarPayloadPix({ chave, nomeRecebedor, cidade, valor, txid }: DadosPix): string {
  const nome = normalizarTexto(nomeRecebedor, 25);
  const cidadeNormalizada = normalizarTexto(cidade || "VALENTE", 15);
  const idTransacao = (txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";

  const merchantAccountInfo = campo("00", "br.gov.bcb.pix") + campo("01", chave.trim());

  const camposAdicionais = campo("05", idTransacao);

  const partes = [
    campo("00", "01"), // Payload Format Indicator
    campo("26", merchantAccountInfo), // Merchant Account Info (GUI + chave)
    campo("52", "0000"), // Merchant Category Code
    campo("53", "986"), // Moeda: BRL
    ...(valor && valor > 0 ? [campo("54", valor.toFixed(2))] : []),
    campo("58", "BR"), // Pais
    campo("59", nome), // Nome do recebedor
    campo("60", cidadeNormalizada), // Cidade do recebedor
    campo("62", camposAdicionais), // Identificador da transacao
  ];

  const payloadSemCrc = partes.join("") + "6304";
  const crc = crc16ccitt(payloadSemCrc);
  return payloadSemCrc + crc;
}
