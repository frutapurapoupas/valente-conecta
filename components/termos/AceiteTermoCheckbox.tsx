"use client";

// Caminho: C:\valente_conecta\components\termos\AceiteTermoCheckbox.tsx
//
// Checkbox reutilizável de aceite de termo/política, com o link pro termo
// completo embutido no meio do texto do resumo — usado em todo fluxo de
// cadastro/ativação (cadastro geral, moto-táxi, carona solidária, virar
// lojista, ver 095_termos_aceite_cadastro.sql). Reaproveita a mesma
// abordagem "resumo inline + link" já usada em
// components/pdv/ValidacaoProprietarioLoja.tsx, generalizada pra qualquer
// termo. `variante="escura"` serve pro popup escuro do CadastroPopup;
// o padrão claro serve pro resto do app.

import Link from "next/link";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  textoAntes: string;
  textoLink: string;
  href: string;
  textoDepois?: string;
  variante?: "clara" | "escura";
}

export function AceiteTermoCheckbox({ checked, onChange, textoAntes, textoLink, href, textoDepois, variante = "clara" }: Props) {
  const corTexto = variante === "escura" ? "text-gray-300" : "text-gray-700";
  const corLink = variante === "escura" ? "text-emerald-400" : "text-blue-600";

  return (
    <label className={`flex items-start gap-2 text-sm cursor-pointer ${corTexto}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 shrink-0" />
      <span>
        {textoAntes}{" "}
        <Link href={href} target="_blank" className={`underline font-medium ${corLink}`}>
          {textoLink}
        </Link>
        {textoDepois}
      </span>
    </label>
  );
}
