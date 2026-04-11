'use client'

export default function LoginForm({
  action,
  erro,
}: {
  action: (fd: FormData) => Promise<void>
  erro: boolean
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic text-indigo-400 uppercase tracking-tight">VC</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Admin Master</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Senha de acesso
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••••••"
              className={`w-full bg-zinc-900 border rounded-2xl px-4 py-3.5 text-white text-base outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700 ${
                erro ? 'border-red-500/60' : 'border-zinc-800'
              }`}
            />
            {erro && (
              <p className="text-red-400 text-xs font-bold mt-0.5">Senha incorreta. Tente novamente.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-black uppercase tracking-wider rounded-2xl py-3.5 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
