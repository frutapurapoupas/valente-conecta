"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefPage({ params }: { params: { codigo: string } }) {

  const router = useRouter();

  useEffect(() => {

    const codigo = params.codigo;

    if (codigo) {

      localStorage.setItem("vc_referred_by", codigo);

    }

    router.replace("/cadastro");

  }, [params.codigo, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#041022] text-white">
      <p className="text-lg">Preparando seu cadastro...</p>
    </main>
  );
}