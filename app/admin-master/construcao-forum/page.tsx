"use client";

// Caminho: C:\valente_conecta\app\admin-master\construcao-forum\page.tsx
// Moderação do fórum de construção civil — posts ordenados por
// denúncias primeiro (ver app/api/admin-master/construcao-forum/posts/route.ts).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MessageSquare, Flag, Trash2 } from "lucide-react";

interface Post {
  id: string;
  autor_nome: string;
  autor_whatsapp: string | null;
  texto: string;
  midia: { url: string; thumb_url?: string }[];
  denuncias: number;
  created_at: string;
}

export default function ModeracaoForumConstrucaoPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    fetch("/api/admin-master/construcao-forum/posts", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setPosts(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const remover = async (id: string) => {
    try {
      const resp = await fetch(`/api/admin-master/construcao-forum/posts?id=${id}`, { method: "DELETE" });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Post removido.");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-blue-600" /> Fórum Construção Civil
      </h1>
      <p className="text-sm text-gray-500 mb-6">Posts ativos, com os mais denunciados primeiro.</p>

      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum post ainda.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{post.autor_nome}</p>
                  <p className="text-sm text-gray-500">{post.autor_whatsapp} · {new Date(post.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.denuncias > 0 && (
                    <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Flag className="w-3 h-3" /> {post.denuncias}
                    </span>
                  )}
                  <button onClick={() => remover(post.id)} className="p-2 text-gray-400 hover:text-red-600" title="Remover post">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{post.texto}</p>
              {post.midia?.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {post.midia.map((m, i) => (
                    <img key={i} src={m.thumb_url || m.url} alt="" className="aspect-square object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
