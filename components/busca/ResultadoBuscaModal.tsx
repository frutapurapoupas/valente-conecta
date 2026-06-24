'use client';

import React, { useState } from 'react';
import { MapPin, Phone, DollarSign, ChevronDown, ChevronUp, Lock, Eye, ExternalLink } from 'lucide-react';

interface ProdutoLocalizacao {
  id: string;
  nome: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEndereco: string;
  usuarioTelefone: string;
  usuarioPlano?: string;
  usuarioLocalizacao?: { lat: number; lng: number };
  localidade?: string;
  preco: number;
  imagem?: string;
  descricao: string;
}

interface ResultadoAgrupado {
  nome: string;
  preco: number;
  descricao: string;
  imagem?: string;
  categoria: string;
  locations: ProdutoLocalizacao[];
  isGrouped: boolean;
  totalLocations: number;
}

interface ResultadoBuscaModalProps {
  isOpen: boolean;
  produto: ResultadoAgrupado | null;
  dadosDesbloqueados: Record<string, boolean>;
  onDesbloquear: (locationId: string) => void;
  onFechar: () => void;
  precoDesbloqueio: number;
}

export default function ResultadoBuscaModal({
  isOpen,
  produto,
  dadosDesbloqueados,
  onDesbloquear,
  onFechar,
  precoDesbloqueio
}: ResultadoBuscaModalProps) {
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

  if (!isOpen || !produto) return null;

  const toggleExpanded = (locationId: string) => {
    const nova = new Set(expandedLocations);
    if (nova.has(locationId)) {
      nova.delete(locationId);
    } else {
      nova.add(locationId);
    }
    setExpandedLocations(nova);
  };

  // Se é apenas uma localização, mostrar expandido por padrão
  const mostrarTodosExpandidos = !produto.isGrouped;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-end justify-center">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{produto.nome}</h2>
            <p className="text-sm text-blue-100">
              {produto.totalLocations} {produto.totalLocations === 1 ? 'local' : 'locais'} em Valente, BA
            </p>
          </div>
          <button onClick={onFechar} className="text-2xl hover:bg-blue-800 p-2 rounded-full">
            ×
          </button>
        </div>

        {/* Preço destaque */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200 p-4">
          <p className="text-sm text-gray-600">A partir de</p>
          <p className="text-3xl font-bold text-emerald-600">
            R$ {produto.preco.toFixed(2)}
          </p>
          {produto.descricao && (
            <p className="text-sm text-gray-600 mt-2">{produto.descricao}</p>
          )}
        </div>

        {/* Imagem do produto */}
        {produto.imagem && (
          <div className="w-full h-48 bg-gray-100 overflow-hidden">
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Lista de localizações */}
        <div className="p-4 space-y-3">
          {produto.locations.map((loc, idx) => {
            const isExpanded = mostrarTodosExpandidos || expandedLocations.has(loc.id);
            const isDesbloqueado = dadosDesbloqueados[loc.id];
            const precisaBloquear = loc.usuarioPlano === 'gratis' && !isDesbloqueado;

            return (
              <div
                key={loc.id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Card resumido */}
                <button
                  onClick={() => !mostrarTodosExpandidos && toggleExpanded(loc.id)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{loc.usuarioNome}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {precisaBloquear ? (
                        <span className="text-amber-600">*** Desbloqueie para ver endereço ***</span>
                      ) : (
                        <span>{loc.usuarioEndereco}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-emerald-600 mt-1">
                      R$ {loc.preco.toFixed(2)}
                    </div>
                  </div>
                  {produto.isGrouped && !mostrarTodosExpandidos && (
                    <div className="text-gray-500">
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  )}
                </button>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="bg-white border-t border-gray-100 p-4 space-y-3">
                    {/* Telefone */}
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      {precisaBloquear ? (
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">*** Telefone bloqueado ***</p>
                          <button
                            onClick={() => onDesbloquear(loc.id)}
                            className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded mt-1 flex items-center gap-1 hover:bg-amber-200"
                          >
                            <Lock className="w-3 h-3" />
                            Desbloquear por R$ {precoDesbloqueio.toFixed(2)}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{loc.usuarioTelefone}</p>
                      )}
                    </div>

                    {/* Localização + Mapa */}
                    {loc.usuarioLocalizacao && !precisaBloquear && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{loc.usuarioEndereco}</p>
                            <p className="text-xs text-gray-500">
                              Lat: {loc.usuarioLocalizacao.lat.toFixed(4)}, Lng: {loc.usuarioLocalizacao.lng.toFixed(4)}
                            </p>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.usuarioLocalizacao.lat},${loc.usuarioLocalizacao.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Ver rota no Google Maps
                            </a>
                          </div>
                        </div>

                        {/* Mapa embutido */}
                        <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB41DFkJRVnYcNr2Yt6_a5k8Z0Z0Z0Z0Z0&q=${loc.usuarioLocalizacao.lat},${loc.usuarioLocalizacao.lng}`}
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {/* Plano do vendedor */}
                    {loc.usuarioPlano === 'gratis' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
                        Este vendedor não possui plano pago. Alguns dados podem estar limitados.
                      </div>
                    )}

                    {/* Ações */}
                    <div className="pt-2 border-t border-gray-100 flex gap-2">
                      <a
                        href={`https://wa.me/55${loc.usuarioTelefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <i className="fab fa-whatsapp" />
                        WhatsApp
                      </a>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm">
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={onFechar}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
