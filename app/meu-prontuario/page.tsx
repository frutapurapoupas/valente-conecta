'use client';

// Caminho: C:\valente_conecta\app\meu-prontuario\page.tsx
//
// Prontuario do proprio paciente, juntando todas as unidades onde ele ja
// foi atendido pela Fila Virtual de Saude (ver proposta "Modo Valente
// Facil", item 5).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Paperclip, Stethoscope, Pill } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const TIPO_ICONE: Record<string, any> = { historico: Stethoscope, fixo: Pill, exame: Paperclip };
const TIPO_LABEL: Record<string, string> = { historico: 'Atendimento', fixo: 'Informação fixa', exame: 'Exame' };

export default function MeuProntuarioPage() {
  const router = useRouter();
  const [itens, setItens] = useState<any[] | null>(null);

  useEffect(() => {
    const usuario = getCurrentUser();
    if (!usuario) { router.push('/'); return; }
    fetch(`/api/saude-fila/prontuario?usuarioId=${usuario.id}&solicitanteId=${usuario.id}`)
      .then((r) => r.json())
      .then((d) => setItens(d.success ? d.data : []));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2" aria-label="Voltar"><ArrowLeft size={22} /></button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Meu prontuário</h1>
          <p className="text-sm text-gray-500">Seu histórico nas unidades da Fila Virtual de Saúde</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-3">
        {itens === null && <p className="text-center text-gray-400 py-10">Carregando...</p>}
        {itens?.length === 0 && (
          <div className="text-center py-16">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum registro ainda.</p>
          </div>
        )}
        {itens?.map((item) => {
          const Icone = TIPO_ICONE[item.tipo] || FileText;
          return (
            <div key={item.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icone size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-gray-900">{item.titulo}</span>
                <span className="text-sm text-gray-400 ml-auto">{TIPO_LABEL[item.tipo]}</span>
              </div>
              <p className="text-sm text-gray-500">{item.unidades_saude?.nome} · {new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
              {item.conteudo && <p className="text-sm text-gray-700 mt-2">{item.conteudo}</p>}
              {item.anexo_url && (
                <a href={item.anexo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium mt-2">
                  <Paperclip size={13} /> Ver anexo
                </a>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
