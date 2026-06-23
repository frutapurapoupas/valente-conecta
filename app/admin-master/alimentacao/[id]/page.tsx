// app/admin-master/alimentacao/[id]/page.tsx
export default function AdminMasterLoja({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Gestão de Loja ID: {params.id}</h2>
      <div className="flex gap-4 mt-4">
        <button className="bg-red-600 text-white p-2 rounded">Suspender Loja</button>
        <button className="bg-blue-600 text-white p-2 rounded">Enviar Nota ao Admin</button>
      </div>
      {/* Lista de publicações da loja com botões para remover itens individuais */}
    </div>
  );
}