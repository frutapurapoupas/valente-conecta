// app/admin-master/ia/page.tsx
// 📄 IA & Automação - Chat Valentinha

"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Video, 
  MessageSquare, 
  Zap, 
  Sparkles,
  Command,
  Brain,
  Mic,
  Send,
  Package,
  Eye,
  Loader2,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================================
// COMPONENTE: ComandoRapido
// ============================================================

function ComandoRapido({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-3 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-500/50 hover:bg-gray-750 transition-all text-left group"
    >
      <Icon size={18} className="text-green-400 mb-1 group-hover:scale-110 transition" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-gray-500">/{label.toLowerCase().replace(' ', '-')}</p>
    </button>
  );
}

// ============================================================
// COMPONENTE: Mensagem
// ============================================================

function Mensagem({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? 'bg-green-600/20 border border-green-500/30'
            : 'bg-gray-700/50 border border-gray-600/30'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-[10px] text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Olá! Sou a **Valentinha**, sua assistente de IA.\n\nComo posso ajudar você hoje? Posso:\n\n• 📦 **Gerenciar estoque** - "popular estoque", "mostrar estoque"\n• 🎬 **Criar vídeos** - "criar vídeo sobre [tema]"\n• 📊 **Analisar dados** - "analisar vendas", "relatório"\n• 💡 **Dar dicas** - "dicas para cozinha"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focar no input ao carregar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ============================================================
  // ENVIAR MENSAGEM
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Simular resposta da IA (depois conectar com API real)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const response = gerarRespostaIA(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro na IA:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // ============================================================
  // GERAR RESPOSTA IA (SIMULADA)
  // ============================================================

  const gerarRespostaIA = (input: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes('popular estoque') || lower.includes('popular')) {
      return `📦 **Popular Estoque**

Vou ajudar a popular seu estoque! Aqui estão algumas sugestões:

**Insumos recomendados:**
• Arroz (50kg) - R$ 150,00
• Feijão (30kg) - R$ 90,00
• Óleo (20L) - R$ 120,00
• Farinha (25kg) - R$ 75,00
• Ovos (60 unidades) - R$ 45,00

**Total estimado:** R$ 480,00

Deseja que eu gere uma lista de compras completa? 🔄`;
    }
    
    if (lower.includes('mostrar estoque') || lower.includes('estoque')) {
      return `📊 **Status do Estoque**

**Resumo atual:**
• Arroz: 12kg (⚠️ abaixo do mínimo - 50kg)
• Feijão: 8kg (⚠️ abaixo do mínimo - 30kg)
• Óleo: 5L (⚠️ abaixo do mínimo - 20L)
• Farinha: 15kg (⚠️ abaixo do mínimo - 25kg)
• Ovos: 30 unidades (✅ adequado)

**Alertas:**
🔴 4 insumos com estoque baixo
🟡 1 insumo precisa de reposição em breve

Gostaria de gerar uma lista de compras? 🛒`;
    }
    
    if (lower.includes('criar vídeo') || lower.includes('video')) {
      const tema = input.replace(/criar vídeo|video|sobre/gi, '').trim() || 'cardápio do dia';
      return `🎬 **Criando Vídeo: "${tema}"**

**Estilo:** Reels
**Duração:** 30 segundos
**Formato:** Vertical (9:16)

**Roteiro:**
1. 🎬 Abertura com logo
2. 📸 Mostrar prato principal
3. ✨ Destaque dos ingredientes
4. 🏷️ Promoção especial
5. 📢 Call to action

**Status:** ⏳ Processando...

O vídeo estará pronto em alguns minutos. Deseja receber notificação quando ficar pronto? 🔔`;
    }
    
    if (lower.includes('dicas') || lower.includes('ajuda') || lower.includes('help')) {
      return `💡 **Dicas para sua Cozinha**

**1. Otimize o Cardápio**
• Ofereça 2 opções por dia (uma econômica e uma premium)
• Destaque pratos com maior margem de lucro

**2. Controle de Estoque**
• Faça inventário semanal
• Use o sistema de alerta de estoque mínimo
• Compre insumos em quantidade para melhor preço

**3. Marketing**
• Poste fotos dos pratos nas redes sociais
• Use a Fábrica de Vídeos para criar conteúdo rápido
• Ofereça desconto para pedidos recorrentes

**4. Precificação**
• Calcule custo por porção
• Margem recomendada: 60-70%
• Ajuste preços conforme sazonalidade

Precisa de ajuda com algum desses tópicos? 🧑‍🍳`;
    }
    
    if (lower.includes('analisar vendas') || lower.includes('relatório')) {
      return `📊 **Relatório de Vendas - Última Semana**

**Total:** R$ 4.870,00
**Média diária:** R$ 695,71

**Melhor dia:** Sexta-feira (R$ 1.230,00)
**Dia com menor venda:** Segunda-feira (R$ 420,00)

**Prato mais vendido:** Feijoada (42 unidades)
**Maior faturamento:** Lasanha (R$ 890,00)

**Recomendação:** Aumentar estoque para sexta-feira e criar promoção para segunda-feira. 📈`;
    }

    // Resposta padrão
    return `🤔 **Entendi sua solicitação!**

Para te ajudar melhor, aqui estão alguns comandos que você pode usar:

• **Estoque** → "popular estoque" ou "mostrar estoque"
• **Vídeos** → "criar vídeo sobre [tema]"
• **Dicas** → "dicas" ou "ajuda"
• **Relatórios** → "analisar vendas" ou "relatório"

O que você gostaria de fazer? 🚀`;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="text-green-400" />
              IA & Automação
            </h1>
            <p className="text-sm text-gray-400">Assistente inteligente para gerenciar sua cozinha</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.href = '/admin-master/fabrica-videos'}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Video size={16} /> Fábrica de Vídeos
            </button>
          </div>
        </div>

        {/* Comandos Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <ComandoRapido 
            icon={Package} 
            label="Popular Estoque" 
            onClick={() => setInput('popular estoque')}
          />
          <ComandoRapido 
            icon={Eye} 
            label="Mostrar Estoque" 
            onClick={() => setInput('mostrar estoque')}
          />
          <ComandoRapido 
            icon={Video} 
            label="Criar Vídeo" 
            onClick={() => setInput('criar vídeo sobre cardápio')}
          />
          <ComandoRapido 
            icon={Sparkles} 
            label="Dicas" 
            onClick={() => setInput('dicas')}
          />
        </div>

        {/* Chat */}
        <div className={`bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden transition-all ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Header do Chat */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/80">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-green-400" />
              <span className="font-medium">Valentinha</span>
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">Online</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-gray-700 rounded transition"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mensagens */}
              <div className="h-[calc(100%-120px)] overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <Mensagem key={msg.id} message={msg} />
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t border-gray-700 p-3 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite um comando ou pergunta..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                  title="Busca por voz (em breve)"
                >
                  <Mic size={18} className="text-gray-400" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          💡 Dica: Use "/" para comandos rápidos • A Valentinha aprende com cada interação
        </div>
      </div>
    </div>
  );
}