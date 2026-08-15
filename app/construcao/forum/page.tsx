"use client";

// Caminho: C:\valente_conecta\app\construcao\forum\page.tsx
//
// Forum dos usuarios do app pra falar de construcao civil (ver
// app/api/construcao/forum/*). So' quem tem cadastro real
// (getCurrentUser()) participa — ver nota de identidade na migration
// 048_forum_construcao_civil.sql. Publicar exige aceitar o termo de
// compromisso uma vez.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, MessageSquare, Plus, Flag, X, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

interface Post {
  id: string;
  usuario_id: string;
  autor_nome: string;
  texto: string;
  midia: MidiaItem[];
  created_at: string;
}

const TERMO_TEXTO = `Este fórum é um espaço dos usuários do Valente Conecta para trocar experiências sobre serviços de construção civil.

Ao publicar aqui, você se compromete a:
- Postar apenas conteúdo relacionado a serviços de construção civil (dúvidas, orçamentos, indicações, fotos de trabalhos).
- Não publicar imagens ofensivas, ilegais, ou impróprias.
- Não discutir política ou religião — o espaço é só para falar de serviços.
- Tratar os outros profissionais e usuários com respeito.

Posts que violem esses combinados podem ser removidos, e o acesso ao fórum pode ser suspenso.`;

export default function ForumConstrucaoPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [termoAceito, setTermoAceito] = useState<boolean | null>(null);
  const [mostrarTermo, setMostrarTermo] = useState(false);
  const [mostrarComposer, setMostrarComposer] = useState(false);
  const [texto, setTexto] = useState("");
  const [midia, setMidia] = useState<MidiaItem[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [denunciados, setDenunciados] = useState<Set<string>>(new Set());

  const carregarPosts = () => {
    fetch("/api/construcao/forum/posts", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setPosts(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setUsuario(getCurrentUser());
    carregarPosts();
  }, []);

  const abrirComposer = async () => {
    if (!usuario) {
      toast.error("Complete seu cadastro no app pra publicar.");
      return;
    }
    if (termoAceito === null) {
      const res = await fetch(`/api/construcao/forum/termo?usuarioId=${usuario.id}`).then((r) => r.json());
      const aceito = res.success && res.data.aceito;
      setTermoAceito(aceito);
      if (!aceito) { setMostrarTermo(true); return; }
    } else if (!termoAceito) {
      setMostrarTermo(true);
      return;
    }
    setMostrarComposer(true);
  };

  const aceitarTermo = async () => {
    if (!usuario) return;
    await fetch("/api/construcao/forum/termo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuario.id }),
    });
    setTermoAceito(true);
    setMostrarTermo(false);
    setMostrarComposer(true);
  };

  const publicar = async () => {
    if (!usuario || !texto.trim()) {
      toast.error("Escreva algo antes de publicar.");
      return;
    }
    setPublicando(true);
    try {
      const resp = await fetch("/api/construcao/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, texto: texto.trim(), midia }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Publicado!");
      setTexto("");
      setMidia([]);
      setMostrarComposer(false);
      carregarPosts();
    } catch (err: any) {
      toast.error(err.message || "Erro ao publicar");
    } finally {
      setPublicando(false);
    }
  };

  const denunciar = async (postId: string) => {
    if (!usuario) {
      toast.error("Complete seu cadastro no app pra denunciar.");
      return;
    }
    await fetch("/api/construcao/forum/denunciar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, denuncianteId: usuario.id }),
    });
    setDenunciados((prev) => new Set(prev).add(postId));
    toast.success("Denúncia enviada. Obrigado por ajudar a manter o fórum saudável.");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 text-white">
          <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Fórum Construção Civil</h1>
          <button onClick={abrirComposer} className="text-xs bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Publicar
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Ainda não tem nenhuma publicação. Seja o primeiro!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800">{post.autor_nome}</p>
                <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{post.texto}</p>
              {post.midia?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {post.midia.map((m, i) => (
                    <img key={i} src={m.thumb_url || m.url} alt="" className="aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <button
                onClick={() => denunciar(post.id)}
                disabled={denunciados.has(post.id)}
                className="mt-3 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5" /> {denunciados.has(post.id) ? "Denunciado" : "Denunciar"}
              </button>
            </div>
          ))
        )}
      </main>

      {mostrarTermo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3"><ShieldCheck className="w-5 h-5 text-blue-600" /> Termo de compromisso</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-72 overflow-y-auto">{TERMO_TEXTO}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setMostrarTermo(false)} className="flex-1 py-2.5 rounded-lg border text-gray-600 font-medium">Cancelar</button>
              <button onClick={aceitarTermo} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium">Aceito e quero publicar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarComposer && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Nova publicação</h2>
              <button onClick={() => setMostrarComposer(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Fale sobre um serviço, tire uma dúvida, mostre um trabalho..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
              autoFocus
            />
            <MidiaUploader midia={midia} onChange={setMidia} maximo={4} />
            <button
              onClick={publicar}
              disabled={publicando}
              className="w-full mt-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60"
            >
              {publicando ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
