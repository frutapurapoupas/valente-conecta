"use client";
// Camada 3 (admin master) do módulo Serviços — substitui o antigo DemandView
// (formulário público de captação, indevidamente usado como página de admin).
import { AdminMasterModuloShell } from "@/components/catalogo/AdminMasterModuloShell";

export default function Page() {
  return <AdminMasterModuloShell modulo="servicos" labelModulo="Serviços" />;
}
