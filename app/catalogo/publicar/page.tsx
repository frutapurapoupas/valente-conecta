"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useWizardProduto } from "./hooks/useWizardProduto";
import { WizardCategoria } from "./components/WizardCategoria";
import { WizardAtributos } from "./components/WizardAtributos";
import { WizardMidia } from "./components/WizardMidia";
import { WizardResumo } from "./components/WizardResumo";

export default function PublicarProdutoPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { categorias, loading, wizardState, setCategoria, updateRespostas, updateImagens, updateVideo, publicar } = useWizardProduto();
  const [skuGerado, setSkuGerado] = useState("");

  useEffect(() => {
    if (wizardState.categoria_id && wizardState.respostas) {
      const sku = "SKU-" + Object.values(wizardState.respostas)
        .filter(v => v)
        .map(v => String(v).substring(0, 3).toUpperCase())
        .join("-");
      setSkuGerado(sku);
    }
  }, [wizardState.categoria_id, wizardState.respostas]);

  const handleNext = () => { if (step < 3) setStep(step + 1); };
  const handleBack = () => { if (step > 0) setStep(step - 1); };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="text-gray-500 mt-4">Carregando...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div><h1 className="text-xl font-bold">Publicar Produto</h1><p className="text-sm text-gray-500">Passo {step + 1} de 4</p></div>
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {step === 0 && <WizardCategoria categorias={categorias} selected={wizardState.categoria_id} onSelect={(id) => { setCategoria(id); handleNext(); }} />}
          {step === 1 && wizardState.categoria_id && (
            <>
              <WizardAtributos categoria={categorias.find(c => c.id === wizardState.categoria_id)!} respostas={wizardState.respostas} onUpdate={updateRespostas} />
              <div className="mt-6 flex justify-end"><button onClick={handleNext} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2">PrÃ³ximo <ChevronRight className="w-4 h-4" /></button></div>
            </>
          )}
          {step === 2 && (
            <>
              <WizardMidia imagens={wizardState.imagens} video={wizardState.video} onImagensChange={updateImagens} onVideoChange={updateVideo} />
              <div className="mt-6 flex gap-3">
                <button onClick={handleBack} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Voltar</button>
                <button onClick={handleNext} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2">PrÃ³ximo <ChevronRight className="w-4 h-4" /></button>
              </div>
            </>
          )}
          {step === 3 && <WizardResumo produto={wizardState.produto} sku={skuGerado} imagens={wizardState.imagens} video={wizardState.video} onPublicar={() => publicar(skuGerado)} onVoltar={handleBack} />}
        </div>
      </main>
    </div>
  );
}

