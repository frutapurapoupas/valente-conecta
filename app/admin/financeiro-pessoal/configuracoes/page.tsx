'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, AlertCircle } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [moeda, setMoeda] = useState('BRL');

  useEffect(() => {
    const stored = localStorage.getItem('financeiro_config');
    if (stored) {
      const config = JSON.parse(stored);
      setSaldoInicial(config.saldoInicial || 0);
      setMoeda(config.moeda || 'BRL');
    }
  }, []);

  const salvarConfig = () => {
    localStorage.setItem('financeiro_config', JSON.stringify({ saldoInicial, moeda }));
    alert('âœ… ConfiguraÃ§Ãµes salvas com sucesso!');
  };

  const resetarDados = () => {
    if (confirm('âš ï¸ ATENÃ‡ÃƒO! Isso irÃ¡ apagar TODOS os seus dados financeiros. Tem certeza?')) {
      localStorage.removeItem('financeiro_pessoal');
      localStorage.removeItem('financeiro_categorias');
      alert('âœ… Dados resetados com sucesso!');
      window.location.reload();
    }
  };

  const getMoedaSimbolo = () => {
    const simbolos: Record<string, string> = { BRL: 'R$', USD: 'US$', EUR: 'â‚¬' };
    return simbolos[moeda] || 'R$';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">âš™ï¸ ConfiguraÃ§Ãµes do Financeiro</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ðŸ’° Saldo Inicial</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">{getMoedaSimbolo()}</span>
            <input
              type="number"
              step="0.01"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Valor inicial da sua conta no inÃ­cio do perÃ­odo</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ðŸ’± Moeda</label>
          <select
            value={moeda}
            onChange={(e) => setMoeda(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="BRL">Real Brasileiro (R$)</option>
            <option value="USD">DÃ³lar Americano (US$)</option>
            <option value="EUR">Euro (â‚¬)</option>
          </select>
        </div>

        <button
          onClick={salvarConfig}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mb-4 transition-colors"
        >
          <Save className="w-4 h-4" /> Salvar ConfiguraÃ§Ãµes
        </button>

        <button
          onClick={resetarDados}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Resetar Todos os Dados
        </button>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            Resetar irÃ¡ apagar todas as transaÃ§Ãµes, categorias e configuraÃ§Ãµes. Esta aÃ§Ã£o nÃ£o pode ser desfeita.
          </p>
        </div>
      </div>
    </div>
  );
}

