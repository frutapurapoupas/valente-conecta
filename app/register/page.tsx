"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(name, email, password);
    if (success) { toast.success("Cadastro realizado! Ganhe R$5 de bônus!"); router.push("/"); }
    else { toast.error("Erro ao cadastrar"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 rounded-3xl p-8 w-full max-w-md"><div className="text-center mb-8"><div className="text-5xl mb-3">📝</div><h1 className="text-2xl font-bold text-white">Criar Conta</h1><p className="text-green-400 text-sm">🎁 Ganhe R$5 de bônus no cadastro!</p></div>
      <form onSubmit={handleSubmit} className="space-y-4"><input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white" required /><input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white" required /><input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white" required /><button type="submit" disabled={loading} className="w-full bg-green-500 text-black py-3 rounded-xl font-bold">{loading ? "Cadastrando..." : "Cadastrar"}</button></form>
      <p className="text-center text-gray-400 text-sm mt-4">Já tem conta? <button onClick={() => router.push("/login")} className="text-blue-400">Faça login</button></p></div>
    </div>
  );
}
