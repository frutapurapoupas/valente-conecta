// app/fornecedor/catalog/page.tsx
export default function AdminLoja() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Catálogo de Produtos</h2>
      <input placeholder="Nome do Produto" className="border p-2 w-full mb-2" />
      <textarea placeholder="Descrição curta e detalhada" className="border p-2 w-full mb-2" />
      <label><input type="checkbox" /> É Promoção?</label>
      <button className="bg-green-600 text-white p-2 w-full">Publicar no Valente Conecta</button>
    </div>
  );
}