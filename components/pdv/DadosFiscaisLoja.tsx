"use client";

// Caminho: C:\valente_conecta\components\pdv\DadosFiscaisLoja.tsx
//
// Formulario colapsavel de dados fiscais do comerciante (CNPJ/CPF,
// Inscricao Estadual, regime tributario, endereco estruturado) --
// preparacao pra emissao de NFC-e futura (ver 091_pdv_preparacao_fiscal.sql
// e app/api/pdv/dados-fiscais/route.ts). Nao emite nada, so' guarda
// cadastro pra nao precisar parar tudo depois quando a integracao real
// for ativada.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface DadosFiscaisLojaProps {
  usuarioId: string;
}

interface FormFiscal {
  cnpjCpf: string;
  inscricaoEstadual: string;
  regimeTributario: string;
  enderecoCep: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoComplemento: string;
  enderecoBairro: string;
  enderecoMunicipio: string;
  enderecoUf: string;
}

const FORM_VAZIO: FormFiscal = {
  cnpjCpf: "", inscricaoEstadual: "", regimeTributario: "",
  enderecoCep: "", enderecoLogradouro: "", enderecoNumero: "", enderecoComplemento: "",
  enderecoBairro: "", enderecoMunicipio: "", enderecoUf: "",
};

export function DadosFiscaisLoja({ usuarioId }: DadosFiscaisLojaProps) {
  const [aberto, setAberto] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<FormFiscal>(FORM_VAZIO);

  useEffect(() => {
    if (!aberto || carregado) return;
    fetch(`/api/pdv/dados-fiscais?usuarioId=${usuarioId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => {
        const p = resp?.data;
        if (p) {
          setForm({
            cnpjCpf: p.cnpj_cpf || "",
            inscricaoEstadual: p.inscricao_estadual || "",
            regimeTributario: p.regime_tributario || "",
            enderecoCep: p.endereco_cep || "",
            enderecoLogradouro: p.endereco_logradouro || "",
            enderecoNumero: p.endereco_numero || "",
            enderecoComplemento: p.endereco_complemento || "",
            enderecoBairro: p.endereco_bairro || "",
            enderecoMunicipio: p.endereco_municipio || "",
            enderecoUf: p.endereco_uf || "",
          });
        }
      })
      .finally(() => setCarregado(true));
  }, [aberto, carregado, usuarioId]);

  const campo = (chave: keyof FormFiscal) => ({
    value: form[chave],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [chave]: e.target.value })),
  });

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/pdv/dados-fiscais", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, ...form }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Dados fiscais salvos!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-700">
          <Building2 className="w-4 h-4 text-blue-600" /> Dados fiscais da loja
        </span>
        {aberto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {aberto && (
        <div className="p-4 pt-0 space-y-3 border-t">
          <p className="text-xs text-gray-500">
            Preencha agora pra já deixar pronto — isso não emite nada ainda, só evita ter que parar tudo depois pra recadastrar quando a emissão automática for ativada.
          </p>

          {!carregado ? (
            <p className="text-sm text-gray-400 py-4 text-center">Carregando...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">CNPJ ou CPF</label>
                  <input {...campo("cnpjCpf")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Só números" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Inscrição Estadual</label>
                  <input {...campo("inscricaoEstadual")} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Isento, se não tiver" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Regime tributário</label>
                  <select {...campo("regimeTributario")} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Selecione</option>
                    <option value="mei">MEI</option>
                    <option value="simples_nacional">Simples Nacional</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-gray-500 mb-2">Endereço fiscal</p>
                <div className="grid grid-cols-2 gap-3">
                  <input {...campo("enderecoCep")} placeholder="CEP" className="px-3 py-2 border rounded-lg text-sm" />
                  <input {...campo("enderecoUf")} placeholder="UF" maxLength={2} className="px-3 py-2 border rounded-lg text-sm uppercase" />
                  <input {...campo("enderecoLogradouro")} placeholder="Rua/Avenida" className="col-span-2 px-3 py-2 border rounded-lg text-sm" />
                  <input {...campo("enderecoNumero")} placeholder="Número" className="px-3 py-2 border rounded-lg text-sm" />
                  <input {...campo("enderecoComplemento")} placeholder="Complemento" className="px-3 py-2 border rounded-lg text-sm" />
                  <input {...campo("enderecoBairro")} placeholder="Bairro" className="px-3 py-2 border rounded-lg text-sm" />
                  <input {...campo("enderecoMunicipio")} placeholder="Município" className="px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              <button
                onClick={salvar}
                disabled={salvando}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {salvando ? "Salvando..." : "Salvar dados fiscais"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
