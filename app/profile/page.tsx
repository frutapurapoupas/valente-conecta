"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateWallet } = useApp();

  if (!user) { router.push("/login"); return null; }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3"><button onClick={() => router.back()}><i className="fas fa-arrow-left text-white"></i></button><h1 className="text-white font-bold text-xl">👤 Meu Perfil</h1></header>

      <div className="p-4 text-center"><div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mx-auto">{user.name.charAt(0)}</div><h2 className="text-2xl font-bold text-white mt-3">{user.name}</h2><p className="text-gray-400">{user.email}</p><p className="text-yellow-400 text-sm mt-1">Plano: {user.plan || "Grátis"}</p></div>

      <div className="p-4 space-y-3"><div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center"><div><p className="text-gray-400 text-sm">Carteira Digital</p><p className="text-2xl font-bold text-green-400">R$ {user.wallet.toFixed(2)}</p></div><button className="bg-green-500 text-black px-4 py-2 rounded-xl text-sm">Adicionar Saldo</button></div><div className="bg-white/10 rounded-2xl p-4"><p className="text-gray-400 text-sm mb-2">Indique amigos e ganhe!</p><div className="flex items-center gap-2"><input type="text" value="https://valenteconecta.com/convite/abc123" readOnly className="flex-1 bg-white/20 rounded-xl p-2 text-white text-xs" /><button onClick={() => { navigator.clipboard.writeText("https://valenteconecta.com/convite/abc123"); toast.success("Link copiado!"); }} className="bg-blue-500 px-3 py-2 rounded-xl text-sm">Copiar</button></div></div><button onClick={logout} className="w-full bg-red-500/20 border border-red-500 text-red-400 py-3 rounded-xl font-bold mt-4">Sair da Conta</button></div>
    </div>
  );
}
