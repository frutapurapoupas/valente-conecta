"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\hooks\useImportacaoEstoque.ts
//
// Estado do wizard de importação de planilha: parse client-side (xlsx já
// está no package.json, nunca tinha sido usado antes), mapeamento de
// colunas, e envio em lotes pra /api/pdv/importar-estoque/lote com barra
// de progresso.

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  CAMPOS_MAPEAVEIS,
  TAMANHO_LOTE,
  type CampoMapeavel,
  type LinhaPlanilha,
  type MapeamentoColunas,
  type ResultadoLinha,
} from "@/lib/pdv/importacaoEstoqueTypes";

const SUGESTOES_NOME: Record<CampoMapeavel["campo"], string[]> = {
  nome: ["nome", "produto", "descrição", "descricao", "item"],
  ean: ["ean", "código de barras", "codigo de barras", "gtin", "cod barras", "cod_barras"],
  preco: ["preço", "preco", "valor", "preço venda", "preco_venda"],
  quantidade: ["quantidade", "qtd", "estoque", "qtde"],
  categoria: ["categoria", "grupo", "seção", "secao"],
};

function sugerirMapeamento(cabecalho: string[]): MapeamentoColunas {
  const mapeamento: MapeamentoColunas = { nome: null, ean: null, preco: null, quantidade: null, categoria: null };
  const normalizados = cabecalho.map((c) => c.toLowerCase().trim());

  for (const campo of CAMPOS_MAPEAVEIS) {
    const candidatos = SUGESTOES_NOME[campo.campo];
    const indice = normalizados.findIndex((coluna) => candidatos.some((c) => coluna.includes(c)));
    if (indice >= 0) mapeamento[campo.campo] = indice;
  }
  return mapeamento;
}

function paraNumero(valor: unknown): number | undefined {
  if (valor === undefined || valor === null || valor === "") return undefined;
  const limpo = String(valor).replace(/[^\d,.-]/g, "").replace(",", ".");
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : undefined;
}

export function useImportacaoEstoque() {
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [cabecalho, setCabecalho] = useState<string[]>([]);
  const [linhasBrutas, setLinhasBrutas] = useState<string[][]>([]);
  const [mapeamento, setMapeamento] = useState<MapeamentoColunas>({ nome: null, ean: null, preco: null, quantidade: null, categoria: null });
  const [modulo, setModulo] = useState("mercados");
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState({ enviadas: 0, total: 0 });
  const [resultados, setResultados] = useState<ResultadoLinha[]>([]);
  const [erroArquivo, setErroArquivo] = useState("");

  const carregarArquivo = async (arquivo: File) => {
    setErroArquivo("");
    try {
      const buffer = await arquivo.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const primeiraPlanilha = workbook.Sheets[workbook.SheetNames[0]];
      const linhas: string[][] = XLSX.utils.sheet_to_json(primeiraPlanilha, { header: 1, blankrows: false, defval: "" });
      if (linhas.length < 2) throw new Error("A planilha precisa ter um cabeçalho e pelo menos uma linha de produto.");

      const [primeiraLinha, ...resto] = linhas;
      const cabecalhoTexto = primeiraLinha.map((c) => String(c));
      setNomeArquivo(arquivo.name);
      setCabecalho(cabecalhoTexto);
      setLinhasBrutas(resto.map((linha) => linha.map((c) => String(c))));
      setMapeamento(sugerirMapeamento(cabecalhoTexto));
      setResultados([]);
    } catch (err: any) {
      setErroArquivo(err?.message || "Não foi possível ler essa planilha.");
    }
  };

  const linhasProcessadas = useMemo(() => {
    const validas: LinhaPlanilha[] = [];
    const invalidas: { linha: number; motivo: string }[] = [];

    linhasBrutas.forEach((linha, indice) => {
      const nome = mapeamento.nome !== null ? linha[mapeamento.nome]?.trim() : "";
      const preco = mapeamento.preco !== null ? paraNumero(linha[mapeamento.preco]) : undefined;

      if (!nome) {
        invalidas.push({ linha: indice + 2, motivo: "Sem nome" });
        return;
      }
      if (preco === undefined) {
        invalidas.push({ linha: indice + 2, motivo: "Sem preço válido" });
        return;
      }

      validas.push({
        nome,
        ean: mapeamento.ean !== null ? linha[mapeamento.ean]?.trim() || undefined : undefined,
        preco,
        quantidade: mapeamento.quantidade !== null ? paraNumero(linha[mapeamento.quantidade]) : undefined,
        categoria: mapeamento.categoria !== null ? linha[mapeamento.categoria]?.trim() || undefined : undefined,
      });
    });

    return { validas, invalidas };
  }, [linhasBrutas, mapeamento]);

  const publicar = async (donoId: string) => {
    const { validas } = linhasProcessadas;
    setEnviando(true);
    setProgresso({ enviadas: 0, total: validas.length });
    setResultados([]);

    const todosResultados: ResultadoLinha[] = [];
    for (let i = 0; i < validas.length; i += TAMANHO_LOTE) {
      const lote = validas.slice(i, i + TAMANHO_LOTE);
      try {
        const resposta = await fetch("/api/pdv/importar-estoque/lote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ donoId, modulo, linhas: lote }),
        });
        const resultado = await resposta.json();
        if (resultado.success) {
          const ajustados = resultado.resultados.map((r: ResultadoLinha) => ({ ...r, linha_index: r.linha_index + i }));
          todosResultados.push(...ajustados);
        } else {
          lote.forEach((_, idx) => todosResultados.push({ linha_index: i + idx, status: "erro", erro: resultado.error }));
        }
      } catch (err: any) {
        lote.forEach((_, idx) => todosResultados.push({ linha_index: i + idx, status: "erro", erro: "Falha de conexão" }));
      }
      setProgresso({ enviadas: Math.min(i + TAMANHO_LOTE, validas.length), total: validas.length });
      setResultados([...todosResultados]);
    }
    setEnviando(false);
  };

  return {
    nomeArquivo,
    cabecalho,
    linhasBrutas,
    mapeamento,
    setMapeamento,
    modulo,
    setModulo,
    erroArquivo,
    carregarArquivo,
    linhasProcessadas,
    enviando,
    progresso,
    resultados,
    publicar,
  };
}
