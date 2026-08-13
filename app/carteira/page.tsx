'use client';

// Caminho: C:\valente_conecta\app\carteira\page.tsx
//
// Carteira real da Moeda Conecta (antes era 100% maquete — saldo, extrato e
// ate a chave PIX exibida eram valores fixos no codigo, nada persistia).
// Agora mostra o saldo autoritativo (moeda_conecta_contas) e permite
// receber (mostrando seu proprio codigo) e transferir/pagar (via RPC
// atomica, ver 031_moeda_conecta_real.sql). "Recarregar"/"Sacar" (converter
// pra dinheiro de verdade) nao foram implementados aqui de proposito — isso
// exigiria uma decisao separada sobre custodia/regulacao, nao pedida ainda.
// "Indicar Amigo" nao foi duplicado aqui: o app ja tem um fluxo real de
// indicacao com bonus em R$ em /qr-code, este card so' linka pra la.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet, ArrowUpCircle, ArrowDownCircle, QrCode, History, Copy, Check,
  Eye, EyeOff, Clock, Gift, Send, X, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from '@/lib/auth';

interface Transacao {
  id: string;
  tipo: string;
  remetente_id: string;
  remetente_nome: string;
  destinatario_id: string;
  destinatario_nome: string;
  cidade: string;
  cidade_destino: string;
  valor: number;
  descricao: string;
  status: 'concluida' | 'pendente_moderacao' | 'estornada';
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  concluida: 'Concluída',
  pendente_moderacao: 'Aguardando aprovação (entre cidades)',
  estornada: 'Estornada',
};

export default function CarteiraPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [saldo, setSaldo] = useState(0);
  const [cidadeBase, setCidadeBase] = useState('');
  const [moedaConfig, setMoedaConfig] = useState<{ moeda_nome: string; moeda_prefixo: string } | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaldo, setShowSaldo] = useState(true);
  const [showModalReceber, setShowModalReceber] = useState(false);
  const [showModalPagar, setShowModalPagar] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const [destinoCodigo, setDestinoCodigo] = useState('');
  const [valorPagar, setValorPagar] = useState(0);
  const [descricaoPagar, setDescricaoPagar] = useState('');
  const [enviando, setEnviando] = useState(false);

  const meuCodigo = usuario ? `MC-${usuario.id}|${(usuario.cidade_base || cidadeBase || '').toUpperCase()}` : '';
  const sigla = moedaConfig?.moeda_prefixo || 'MC';
  const qrUrl = meuCodigo ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(meuCodigo)}` : '';

  const carregarDados = async (u: any) => {
    setLoading(true);
    try {
      const [saldoRes, transRes] = await Promise.all([
        fetch(`/api/moeda-conecta/saldo?usuarioId=${u.id}`, { cache: 'no-store' }).then((r) => r.json()),
        fetch(`/api/moeda-conecta/transactions?userId=${u.id}&limit=5`, { cache: 'no-store' }).then((r) => r.json()),
      ]);
      if (saldoRes.success) {
        setSaldo(Number(saldoRes.data.saldo || 0));
        const cidade = saldoRes.data.cidade_base || u.cidade_base || '';
        setCidadeBase(cidade);
        if (cidade) {
          fetch(`/api/moeda-conecta/cidade-config?cidade=${encodeURIComponent(cidade)}`)
            .then((r) => r.json())
            .then((res) => res.success && setMoedaConfig(res.data));
        }
      }
      if (transRes.success) setTransacoes(transRes.data);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (u) carregarDados(u);
    else setLoading(false);
  }, []);

  const enviarPagamento = async () => {
    if (!usuario) return;
    if (!destinoCodigo.trim()) {
      toast.error('Cole o código de quem vai receber');
      return;
    }
    if (!Number.isFinite(valorPagar) || valorPagar <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (valorPagar > saldo) {
      toast.error('Saldo insuficiente');
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch('/api/moeda-conecta/transferir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remetenteId: usuario.id,
          destinatarioCodigo: destinoCodigo.trim(),
          valor: valorPagar,
          descricao: descricaoPagar.trim() || undefined,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      const mensagem =
        resultado.data.status === 'pendente_moderacao'
          ? 'Enviado! Como é para outra cidade, fica retido até o admin master aprovar.'
          : 'Transferência concluída!';
      toast.success(mensagem);
      setShowModalPagar(false);
      setDestinoCodigo('');
      setValorPagar(0);
      setDescricaoPagar('');
      carregarDados(usuario);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao transferir');
    } finally {
      setEnviando(false);
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(meuCodigo);
    setCopiado(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopiado(false), 3000);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
  const formatDate = (iso: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(iso));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Complete seu cadastro pra ter uma carteira de Moeda Conecta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              Carteira Digital
            </h1>
            <p className="text-sm text-gray-500">{moedaConfig?.moeda_nome || 'Moeda Conecta'} — {cidadeBase || 'sua cidade'}</p>
          </div>
          <Link href="/qr-code" className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 text-sm">
            <Gift className="w-4 h-4" />
            Indicar Amigo
          </Link>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <p className="text-sm opacity-90">Saldo disponível</p>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-3xl font-bold">{showSaldo ? `${formatCurrency(saldo)} ${sigla}` : '••••••'}</p>
            <button onClick={() => setShowSaldo(!showSaldo)} className="p-1 hover:bg-white/20 rounded">
              {showSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/20">
            <button
              onClick={() => setShowModalReceber(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              <ArrowDownCircle className="w-4 h-4" /> Receber
            </button>
            <button
              onClick={() => setShowModalPagar(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Send className="w-4 h-4" /> Pagar / Transferir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              Últimas Transações
            </h2>
            <Link href="/extrato" className="text-xs text-blue-600 font-medium">
              Ver extrato completo
            </Link>
          </div>
          <div className="divide-y">
            {transacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma transação ainda</p>
              </div>
            ) : (
              transacoes.map((t) => {
                const entrada = t.destinatario_id === usuario.id;
                return (
                  <div key={t.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${entrada ? 'bg-green-100' : 'bg-red-100'}`}>
                        {entrada ? <ArrowDownCircle className="w-5 h-5 text-green-600" /> : <ArrowUpCircle className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {entrada ? `De ${t.remetente_nome}` : `Para ${t.destinatario_nome}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(t.created_at)} · {STATUS_LABEL[t.status]}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right font-semibold ${entrada ? 'text-green-600' : 'text-red-600'}`}>
                      {entrada ? '+' : '-'} {formatCurrency(t.valor)} {sigla}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModalReceber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Receber</h2>
                <button onClick={() => setShowModalReceber(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Mostre esse QR ou copie o código pra quem vai te pagar.
              </p>
              {qrUrl && <img src={qrUrl} alt="Código de recebimento" className="w-48 h-48 mx-auto mb-4" />}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <p className="font-mono text-xs flex-1 break-all">{meuCodigo}</p>
                <button onClick={copiarCodigo} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs shrink-0">
                  {copiado ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Pagar / Transferir</h2>
                <button onClick={() => setShowModalPagar(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código de quem vai receber</label>
                  <input
                    type="text"
                    value={destinoCodigo}
                    onChange={(e) => setDestinoCodigo(e.target.value)}
                    placeholder="Cole o código (MC-...)"
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{sigla}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={saldo}
                      value={valorPagar || ''}
                      onChange={(e) => setValorPagar(parseFloat(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Saldo disponível: {formatCurrency(saldo)} {sigla}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                  <input
                    type="text"
                    value={descricaoPagar}
                    onChange={(e) => setDescricaoPagar(e.target.value)}
                    placeholder="Ex: Almoço, feira..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex items-start gap-2 bg-amber-50 text-amber-800 text-xs rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  Transferências para alguém de outra cidade ficam retidas até o admin master aprovar.
                </div>

                <button
                  onClick={enviarPagamento}
                  disabled={enviando || valorPagar <= 0 || valorPagar > saldo || !destinoCodigo}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {enviando ? 'Enviando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
