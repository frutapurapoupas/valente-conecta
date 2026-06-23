// app/admin-master/em-construcao/page.tsx
// 🎨 DESIGN - Página de construção

export default function EmConstrucao() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="text-center">
        <h1 className="text-6xl mb-4">🚧</h1>
        <h2 className="text-3xl font-bold mb-2">Em Construção</h2>
        <p className="text-gray-400 mb-8">
          Esta página está sendo desenvolvida e em breve estará disponível.
        </p>
        <div className="w-16 h-1 bg-green-500 mx-auto rounded-full" />
      </div>
    </div>
  );
}