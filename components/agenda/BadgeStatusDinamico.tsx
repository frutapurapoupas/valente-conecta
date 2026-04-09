export default function BadgeStatus({ aberto }: { aberto: boolean }) {
  return (
    <div className="flex items-center gap-4 bg-zinc-900 p-6 rounded-full border-4 border-zinc-800">
      <div className={`w-6 h-6 rounded-full ${aberto ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
      <span className="text-3xl font-black uppercase italic">
        {aberto ? 'Aberto Agora' : 'Fechado'}
      </span>
    </div>
  );
}