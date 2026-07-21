"use client";

import { useUsuarios } from "@/modules/admin";

export default function UsuariosPage() {
  const { data: usuarios, loading, error, remove } = useUsuarios();

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await remove(id);
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.nome}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === "master" ? "bg-purple-100 text-purple-800" :
                    user.role === "admin" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.status === "ativo" ? "bg-green-100 text-green-800" :
                    user.status === "pendente" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
