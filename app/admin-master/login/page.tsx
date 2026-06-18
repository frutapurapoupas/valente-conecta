"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMasterLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === 'admin123') {
      localStorage.setItem('usuario_logado', JSON.stringify({ id: 'master', name: 'Admin Master', role: 'master', isMaster: true }));
      router.push('/admin-master/dashboard');
    } else {
      setError('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
        <h1 className="text-2xl font-bold text-center text-indigo-700">Admin Master</h1>
        <p className="text-center text-gray-500 mb-6">Acesso restrito</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full p-3 border rounded-lg mb-4" />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Entrar</button>
        <p className="text-center text-xs text-gray-400 mt-4">Senha: admin123</p>
      </div>
    </div>
  );
}