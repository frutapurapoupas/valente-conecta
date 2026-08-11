"use client";
// Camada 3 (admin master) do módulo Imóveis — pasta nova, não existia.
import { AdminMasterModuloShell } from "@/components/catalogo/AdminMasterModuloShell";

export default function Page() {
  return <AdminMasterModuloShell modulo="imoveis" labelModulo="Imóveis" />;
}
