"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MachineCard from "@/components/MachineCard";
import ScheduleModal from "@/components/ScheduleModal";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProdutoDetalhePage() {
  const params = useParams();
  const id = (params as { id?: string })?.id;

  const [produto, setProduto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProduto() {
      setLoading(true);

      try {
        let res = await fetch(`/api/catalogo/produto/${id}`);

        if (!res.ok) {
          res = await fetch(`/api/catalogo/produtos?produtoId=${id}`);
        }

        const data = await res.json().catch(() => null);

        if (data?.produto) {
          setProduto(data.produto);
        } else if (Array.isArray(data) && data.length > 0) {
          setProduto(data[0]);
        } else {
          const raw = localStorage.getItem("produtos") || "[]";

          try {
            const produtos = JSON.parse(raw);

            const encontrado = produtos.find(
              (p: any) => String(p.id) === String(id)
            );

            if (encontrado) {
              setProduto(encontrado);
            } else {
              setProduto({
                id,
                nome: "Produto de Exemplo",
                descricao: "Descrição não disponível",
                preco: 0,
                imagem: "/images/placeholder-machine.png",
              });
            }
          } catch {
            setProduto({
              id,
              nome: "Produto de Exemplo",
              descricao: "Descrição não disponível",
              preco: 0,
              imagem: "/images/placeholder-machine.png",
            });
          }
        }
      } catch {
        setProduto({
          id,
          nome: "Produto de Exemplo",
          descricao: "Descrição não disponível",
          preco: 0,
          imagem: "/images/placeholder-machine.png",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProduto();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        Carregando...
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen p-8">
        Produto não encontrado.
      </div>
    );
  }

  const fornecedor = {
    nomeEmpresa:
      produto.fornecedorNome ||
      produto.fornecedor ||
      "",

    endereco:
      produto.fornecedorEndereco ||
      produto.endereco ||
      "",

    telefone:
      produto.fornecedorTelefone ||
      produto.telefone ||
      "",
  };

  const whatsappMsg = encodeURIComponent(
    `Olá, tenho interesse em alugar: ${produto.nome} (ID: ${produto.id}). Gostaria de agendar retirada.`
  );

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="overflow-hidden rounded-2xl bg-white/5">
              <img
                src={
                  produto.imagem ||
                  produto.imagemUrl ||
                  "/images/placeholder-machine.png"
                }
                alt={produto.nome}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              {produto.nome}
            </h1>

            <p className="mt-2 text-sm text-gray-300">
              {produto.descricao}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-2xl font-extrabold text-emerald-400">
                {formatCurrency(
                  produto.preco ??
                    produto.preco_venda ??
                    0
                )}
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${(
                    fornecedor.telefone || ""
                  ).replace(/\D/g, "")}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-green-500 px-4 py-2 font-semibold text-black"
                >
                  WhatsApp
                </a>

                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-full bg-blue-600 px-4 py-2 font-semibold"
                >
                  Agendar retirada
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm text-gray-400">
                Fornecedor
              </h3>

              {fornecedor.nomeEmpresa || fornecedor.endereco ? (
                <div className="mt-2">
                  <MachineCard
                    supplier={{
                      nomeEmpresa: fornecedor.nomeEmpresa,
                      endereco: fornecedor.endereco,
                      telefone: fornecedor.telefone,
                      imagem:
                        produto.fornecedorImagem ||
                        produto.imagem,
                    }}
                  />
                </div>
              ) : (
                <div className="mt-2 text-gray-300">
                  Informações do fornecedor indisponíveis.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ScheduleModal
          product={produto}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}