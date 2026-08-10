// components/user/EmptyStatePopup.tsx
export default function EmptyStatePopup({ categoria, isOpen, onClose }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4">âœ•</button>
        {/* Aqui entra o formulário do image_82c9c4.jpg */}
        <h2 className="text-xl font-bold mb-4">Procurando por {categoria}?</h2>
        <p>Ainda não temos cadastros, mas seus dados serão enviados automaticamente.</p>
        <button className="w-full bg-red-600 text-white py-3 rounded mt-4">Enviar Solicitação</button>
      </div>
    </div>
  );
}

