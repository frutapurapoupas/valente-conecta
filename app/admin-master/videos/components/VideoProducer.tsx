"use client";

import { gerarVideoGratuito, templatesGratuitos } from "@/services/videoGenerator/GoogleVideoService";
import { CheckCircle, Download, Edit3, Image as ImageIcon, Info, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useState } from "react";

type TomType = "informativo" | "divertido" | "emocional" | "urgente";
type DuracaoType = "curto" | "medio" | "longo";

export default function VideoProducer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [roteiro, setRoteiro] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editandoRoteiro, setEditandoRoteiro] = useState(false);
  const [roteiroEditado, setRoteiroEditado] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);
  const [formData, setFormData] = useState({
    tema: "",
    tom: "informativo" as TomType,
    duracao: "medio" as DuracaoType,
    incluirCTA: true,
    mensagemPersonalizada: ""
  });

  const handleGerar = async () => {
    if (!formData.tema && !selectedTemplate) {
      setErro("Selecione um template ou digite um tema!");
      return;
    }

    setIsGenerating(true);
    setErro("");
    setProgresso(0);
    setRoteiro("");
    setThumbnail("");
    setEditandoRoteiro(false);

    const template = templatesGratuitos.find(t => t.id === selectedTemplate);
    const request = {
      tema: template?.tema || formData.tema,
      tom: (template?.tom || formData.tom) as TomType,
      duracao: (template?.duracao || formData.duracao) as DuracaoType,
      incluirCTA: formData.incluirCTA,
      mensagemPersonalizada: formData.mensagemPersonalizada
    };

    const interval = setInterval(() => {
      setProgresso(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const resultado = await gerarVideoGratuito(request);

      if (resultado.status === "falha") {
        throw new Error(resultado.mensagem || "Falha na geração");
      }

      setProgresso(100);
      const roteiroGerado = resultado.roteiro || "";
      setRoteiro(roteiroGerado);
      setRoteiroEditado(roteiroGerado);
      setThumbnail(resultado.thumbnail || "");
    } catch (error: any) {
      console.error("Erro:", error);
      setErro(error.message || "Erro ao gerar. Verifique sua chave API ou tente novamente.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const salvarRoteiroEditado = () => {
    setRoteiro(roteiroEditado);
    setEditandoRoteiro(false);
  };

  const baixarRoteiro = () => {
    const blob = new Blob([roteiro], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro_valentinha_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Alerta de erro */}
      {erro && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-800">
          <div className="flex items-center gap-2 mb-1"><X size={18} className="text-red-600" /><span className="font-semibold">Erro:</span></div>
          <p className="text-sm">{erro}</p>
        </div>
      )}

      {/* Templates rápidos */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Sparkles size={18} className="text-purple-600" /> Templates Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templatesGratuitos.map(t => (
            <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setFormData({ ...formData, tema: t.tema, tom: t.tom as TomType, duracao: t.duracao as DuracaoType }); setErro(""); }} className={`p-4 rounded-xl text-left transition ${selectedTemplate === t.id ? "bg-purple-100 border-2 border-purple-600" : "bg-gray-50 border border-gray-300 hover:bg-gray-100"}`}>
              <div className="text-xl mb-1">{t.nome}</div>
              <div className="text-xs text-gray-600">{t.tema.substring(0, 50)}...</div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulário principal */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Wand2 size={18} className="text-purple-600" /> Criar Roteiro + Thumbnail</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Tema do vídeo *</label>
            <input type="text" value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} placeholder="Ex: Como vender mais, Benefícios do app..." className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-800 placeholder-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🎭 Tom</label>
              <select value={formData.tom} onChange={(e) => setFormData({ ...formData, tom: e.target.value as TomType })} className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800">
                <option value="informativo">📘 Informativo</option>
                <option value="divertido">😄 Divertido</option>
                <option value="emocional">❤️ Emocional</option>
                <option value="urgente">🔥 Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">⏱️ Duração</label>
              <select value={formData.duracao} onChange={(e) => setFormData({ ...formData, duracao: e.target.value as DuracaoType })} className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800">
                <option value="curto">⏱️ Curto (15-20s)</option>
                <option value="medio">⏱️ Médio (30-40s)</option>
                <option value="longo">⏱️ Longo (50-60s)</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 py-2 cursor-pointer">
            <input type="checkbox" checked={formData.incluirCTA} onChange={(e) => setFormData({ ...formData, incluirCTA: e.target.checked })} className="w-4 h-4 accent-purple-600" />
            <span className="text-sm text-gray-700">📢 Incluir chamada para ação (CTA)</span>
          </label>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">✏️ Mensagem personalizada (opcional)</label>
            <textarea value={formData.mensagemPersonalizada} onChange={(e) => setFormData({ ...formData, mensagemPersonalizada: e.target.value })} placeholder="Digite algo que a Valentinha deve dizer..." className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800 placeholder-gray-400 resize-none" rows={3} />
          </div>
          <button onClick={handleGerar} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition">
            {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Gerando roteiro... {progresso}%</> : <><Wand2 size={20} /> Gerar Roteiro + Thumbnail</>}
          </button>
        </div>
      </div>

      {/* Progresso */}
      {isGenerating && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between mb-2"><span className="text-sm font-medium text-gray-700">Processando com IA do Google...</span><span className="text-sm text-purple-600 font-semibold">{progresso}%</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progresso}%` }}></div></div>
          <p className="text-xs text-center text-gray-500 mt-3">{progresso < 50 ? "🤖 Gemini: escrevendo o roteiro da Valentinha..." : "🎨 Imagen: criando a thumbnail..."}</p>
        </div>
      )}

      {/* Roteiro gerado */}
      {roteiro && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-300">
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-green-700"><CheckCircle size={20} /><span className="font-semibold">Roteiro gerado com sucesso!</span></div>
            <div className="flex gap-2">
              {!editandoRoteiro && <button onClick={() => setEditandoRoteiro(true)} className="text-blue-600 text-sm flex items-center gap-1 hover:underline"><Edit3 size={14} /> Editar</button>}
              <button onClick={baixarRoteiro} className="text-gray-600 text-sm flex items-center gap-1 hover:underline"><Download size={14} /> Baixar</button>
            </div>
          </div>
          {editandoRoteiro ? (
            <div className="space-y-3">
              <textarea value={roteiroEditado} onChange={(e) => setRoteiroEditado(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-purple-500" rows={10} />
              <div className="flex gap-2"><button onClick={salvarRoteiroEditado} className="bg-green-600 text-white px-4 py-2 rounded-lg">Salvar</button><button onClick={() => { setEditandoRoteiro(false); setRoteiroEditado(roteiro); }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button></div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-xl max-h-80 overflow-y-auto border border-gray-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{roteiro}</p>
            </div>
          )}
        </div>
      )}

      {/* Thumbnail gerada */}
      {thumbnail && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-300">
          <div className="flex items-center gap-2 text-purple-700 mb-3"><ImageIcon size={20} /><span className="font-semibold">Thumbnail gerada</span></div>
          {thumbnail.startsWith("http") ? (
            <img src={thumbnail} alt="Thumbnail" className="rounded-lg max-h-48 mx-auto border border-gray-200" />
          ) : (
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center border border-purple-200">
              <div className="text-center"><div className="text-6xl mb-2">🎬</div><p className="text-sm text-gray-600">Thumbnail em processamento</p></div>
            </div>
          )}
        </div>
      )}

      {/* Como transformar em vídeo - SOLUÇÃO MANUAL */}
      {roteiro && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-300">
          <div className="flex items-center gap-2 text-blue-700 mb-3"><Info size={20} /><span className="font-semibold">🎬 Como transformar este roteiro em vídeo</span></div>
          <p className="text-sm text-gray-700 mb-4">O vídeo com a Valentinha pode ser criado usando ferramentas gratuitas:</p>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-blue-200"><span className="font-semibold">1. 📱 Filmora/Clipchamp (grátis)</span><p className="text-xs text-gray-600 mt-1">Importe uma imagem da Valentinha, adicione o roteiro como narração e exporte</p></div>
            <div className="bg-white rounded-lg p-3 border border-blue-200"><span className="font-semibold">2. 🎬 Canva (free)</span><p className="text-xs text-gray-600 mt-1">Use o template de vídeo com avatar, cole o roteiro e personalize</p></div>
            <div className="bg-white rounded-lg p-3 border border-blue-200"><span className="font-semibold">3. 🤖 IA de vídeo (Pictory.ai, HeyGen)</span><p className="text-xs text-gray-600 mt-1">Cole o roteiro e a ferramenta gera o vídeo automaticamente</p></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={() => { navigator.clipboard.writeText(roteiro); alert("📋 Roteiro copiado! Cole na ferramenta escolhida."); }} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-center font-semibold flex items-center justify-center gap-2"><Copy size={16} /> Copiar roteiro</button>
            <button onClick={baixarRoteiro} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-center font-semibold flex items-center justify-center gap-2"><Download size={16} /> Baixar roteiro (.txt)</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Copy(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
}