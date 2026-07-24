"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (success) { toast.success("Login realizado!"); router.push("/"); } 
    else { toast.error("Email ou senha inválidos"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="text-5xl mb-3">??</div><h1 className="text-2xl font-bold text-white">Entrar no Valente Conecta</h1><p className="text-gray-400 text-sm">A economia da cidade na palma da mão</p></div>
        <form onSubmit={handleSubmit} className="space-y-4"><input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white placeholder-gray-400" required /><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white placeholder-gray-400" required /><button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold">{loading ? "Entrando..." : "Entrar"}</button></form>
        <div className="text-center mt-4"><button onClick={() => router.push("/register")} className="text-blue-400 text-sm mt-2">Não tem conta? Cadastre-se</button></div>
      </div>
    </div>
  );
}

