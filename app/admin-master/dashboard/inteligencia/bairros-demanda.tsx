// Componente de inteligÃªncia para filtrar demanda por zona
export const DemandMap = () => (
  <div className="p-16 bg-zinc-900 rounded-60">
    <h3 className="text-6xl font-black uppercase mb-10 italic">Onde hÃ¡ Demanda?</h3>
    <ul className="text-4xl font-bold uppercase space-y-6">
      <li className="flex justify-between border-b-2 border-zinc-800 pb-4">
        <span>Bairro Centro</span>
        <span className="text-emerald-500">Pouca Oferta</span>
      </li>
      <li className="flex justify-between border-b-2 border-zinc-800 pb-4">
        <span>Bairro Juazeiro</span>
        <span className="text-valente">SaturaÃ§Ã£o</span>
      </li>
    </ul>
  </div>
);

