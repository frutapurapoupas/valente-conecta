"use client";

import { useState } from 'react';

export default function TesteGeoPage() {
  const [status, setStatus] = useState('Aguardando...');
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const testarGeolocalizacao = () => {
    setCarregando(true);
    setStatus('Verificando suporte do navegador...');
    setErro(null);
    
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      setStatus('❌ ERRO: Seu navegador NÃO suporta geolocalização');
      setErro('Geolocalização não suportada');
      setCarregando(false);
      return;
    }
    
    setStatus('✅ Navegador suporta geolocalização. Solicitando permissão...');
    
    // Opções de geolocalização
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Sucesso
        const { latitude, longitude } = position.coords;
        setLocalizacao({ lat: latitude, lng: longitude });
        setStatus(`✅ SUCESSO! Localização capturada: Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        setCarregando(false);
      },
      (error) => {
        // Erro
        setCarregando(false);
        let mensagemErro = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            mensagemErro = '❌ PERMISSÃO NEGADA: Você precisa permitir o acesso à localização no navegador. Clique no ícone de cadeado na barra de endereço e permita a localização.';
            break;
          case error.POSITION_UNAVAILABLE:
            mensagemErro = '❌ POSIÇÃO INDISPONÍVEL: Não foi possível obter sua localização. Verifique se o GPS está ativo.';
            break;
          case error.TIMEOUT:
            mensagemErro = '❌ TIMEOUT: A solicitação de localização demorou muito. Tente novamente.';
            break;
          default:
            mensagemErro = `❌ ERRO DESCONHECIDO: ${error.message}`;
        }
        setStatus(mensagemErro);
        setErro(mensagemErro);
      },
      options
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">🧪 Teste de Geolocalização</h1>
        
        <button
          onClick={testarGeolocalizacao}
          disabled={carregando}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg mb-6 disabled:opacity-50"
        >
          {carregando ? '🔍 Testando...' : '📍 Testar Geolocalização'}
        </button>
        
        <div className={`rounded-2xl p-4 mb-6 ${erro ? 'bg-red-500/20 border border-red-500' : localizacao ? 'bg-green-500/20 border border-green-500' : 'bg-yellow-500/20 border border-yellow-500'}`}>
          <p className="text-white whitespace-pre-wrap">{status}</p>
        </div>
        
        {localizacao && (
          <div className="bg-green-500/20 rounded-2xl p-4">
            <p className="text-green-400 font-bold mb-2">📍 Localização capturada:</p>
            <p className="text-white">Latitude: {localizacao.lat}</p>
            <p className="text-white">Longitude: {localizacao.lng}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${localizacao.lat}, ${localizacao.lng}`);
                alert('Coordenadas copiadas!');
              }}
              className="mt-3 px-4 py-2 bg-gray-700 rounded-xl text-sm"
            >
              📋 Copiar coordenadas
            </button>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-2xl p-4 mt-6">
          <h2 className="font-bold text-white mb-3">🔧 Como resolver problemas de localização:</h2>
          <ol className="space-y-2 text-gray-300 text-sm">
            <li>1. 🔒 Verifique se o site tem permissão para acessar sua localização</li>
            <li>2. 🌐 No Chrome/Edge: Clique no cadeado na barra de endereço → Permitir localização</li>
            <li>3. 🔄 Depois recarregue a página (F5)</li>
            <li>4. 📱 No celular: Ative o GPS nas configurações</li>
            <li>5. 🔁 Tente novamente após permitir</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
