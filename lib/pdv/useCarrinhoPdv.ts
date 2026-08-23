// Caminho: C:\valente_conecta\lib\pdv\useCarrinhoPdv.ts
//
// Lógica do carrinho da frente de caixa, compartilhada entre
// FrenteCaixaDesktop e FrenteCaixaMobile — cada um só cuida da
// apresentação, a lógica de estado/finalização fica num lugar só.

import { useState } from "react";
import toast from "react-hot-toast";
import type { ClienteFiado, FormaPagamento, ItemCarrinho, ProdutoPDV } from "./frenteCaixaTypes";

function diasParaVencer(validade: string | null): number | null {
  if (!validade) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dataValidade = new Date(validade + "T00:00:00");
  return Math.round((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

interface ResultadoVenda {
  sucesso: boolean;
  erro?: string;
  limiteExcedido?: { saldoAtual: number; limite: number };
  troco?: number;
  saldoTotalCliente?: number;
  dataVencimentoFiado?: string;
}

export function useCarrinhoPdv(usuarioId: string) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  const adicionar = (produto: ProdutoPDV, quantidade = 1) => {
    const dias = diasParaVencer(produto.validade);
    if (dias !== null && dias < 0) {
      toast.error(`${produto.nome} está vencido (venceu há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"})`);
    } else if (dias !== null && dias <= 7) {
      toast(`${produto.nome} vence em ${dias} dia${dias === 1 ? "" : "s"}`, { icon: "⚠️" });
    }

    setCarrinho((prev) => {
      const existente = prev.find((i) => i.estoqueId === produto.estoqueId);
      if (existente) {
        const nova = Math.min(existente.quantidade + quantidade, produto.estoque);
        if (nova === existente.quantidade) return prev;
        return prev.map((i) => (i.estoqueId === produto.estoqueId ? { ...i, quantidade: nova } : i));
      }
      if (produto.estoque < 1) return prev;
      return [
        ...prev,
        {
          chave: produto.estoqueId,
          estoqueId: produto.estoqueId,
          catalogoId: produto.catalogoId,
          ean: produto.ean,
          variante: produto.variante,
          unidade: produto.unidade,
          nome: produto.variante ? `${produto.nome} (${produto.variante})` : produto.nome,
          preco: produto.preco,
          quantidade: Math.min(quantidade, produto.estoque),
          fotoUrl: produto.fotoUrl,
          estoqueDisponivel: produto.estoque,
        },
      ];
    });
  };

  const atualizarQuantidade = (chave: string, quantidade: number) => {
    if (quantidade <= 0) {
      setCarrinho((prev) => prev.filter((i) => i.chave !== chave));
      return;
    }
    setCarrinho((prev) => prev.map((i) => (i.chave === chave ? { ...i, quantidade: Math.min(quantidade, i.estoqueDisponivel) } : i)));
  };

  const removerItem = (chave: string) => setCarrinho((prev) => prev.filter((i) => i.chave !== chave));

  const limpar = () => {
    setCarrinho([]);
    setDesconto(0);
  };

  const subtotal = carrinho.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  const total = Math.max(0, subtotal - desconto);

  const finalizarVenda = async (opcoes: {
    formaPagamento: FormaPagamento;
    cliente?: ClienteFiado | null;
    valorPago?: number;
    fiadoVencimento?: string;
    forcarLimiteFiado?: boolean;
  }): Promise<ResultadoVenda> => {
    if (carrinho.length === 0) return { sucesso: false, erro: "Carrinho vazio" };

    setFinalizando(true);
    try {
      const resp = await fetch("/api/pdv/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          clienteId: opcoes.cliente?.id || null,
          itens: carrinho.map((i) => ({
            catalogoId: i.catalogoId,
            estoqueId: i.estoqueId,
            nome: i.nome,
            precoUnitario: i.preco,
            quantidade: i.quantidade,
          })),
          desconto,
          formaPagamento: opcoes.formaPagamento,
          valorPago: opcoes.valorPago,
          fiadoVencimento: opcoes.fiadoVencimento,
          forcarLimiteFiado: opcoes.forcarLimiteFiado,
        }),
      });
      const resultado = await resp.json();

      if (!resultado.success) {
        if (resultado.limiteExcedido) {
          return { sucesso: false, limiteExcedido: { saldoAtual: resultado.saldoAtual, limite: resultado.limite } };
        }
        return { sucesso: false, erro: resultado.error || "Erro ao finalizar venda" };
      }

      limpar();
      return {
        sucesso: true,
        troco: resultado.data.troco,
        saldoTotalCliente: resultado.data.saldoTotalCliente,
        dataVencimentoFiado: resultado.data.dataVencimentoFiado,
      };
    } catch {
      return { sucesso: false, erro: "Falha de conexão" };
    } finally {
      setFinalizando(false);
    }
  };

  return { carrinho, desconto, setDesconto, adicionar, atualizarQuantidade, removerItem, limpar, subtotal, total, finalizando, finalizarVenda };
}
