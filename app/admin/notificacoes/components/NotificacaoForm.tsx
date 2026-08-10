// app/admin/notificacoes/components/NotificacaoForm.tsx

import { X, Send, Globe, Users, User, MessageCircle, Smartphone, TestTube } from "lucide-react";
import { NovaNotificacaoState, GrupoDinamico, Usuario, Importancia, TipoNotificacao } from "../types/notificacao.types";

interface NotificacaoFormProps {
  novaNotificacao: NovaNotificacaoState;
  setNovaNotificacao: (data: NovaNotificacaoState) => void;
  grupos: GrupoDinamico[];
  usuarios: Usuario[];
  carregandoGrupos: boolean;
  carregandoUsuarios: boolean;
  modoTeste: boolean;
  editandoId: number | string | null;
  enviando: boolean;
  onSalvar: () => void;
  onCancelar: () => void;
  getIconeGrupo: (icone: string) => JSX.Element;
}

export function NotificacaoForm({
  novaNotificacao,
  setNovaNotificacao,
  grupos,
  usuarios,
  carregandoGrupos,
  carregandoUsuarios,
  modoTeste,
  editandoId,
  enviando,
  onSalvar,
  onCancelar,
  getIconeGrupo
}: NotificacaoFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {editandoId ? "✏️ Editar Notificação" : "➕ Nova Notificação"}
        </h2>
        <button onClick={onCancelar} className="text-gray-400">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            type="text"
            value={novaNotificacao.titulo}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, titulo: e.target.value })}
            placeholder="Ex: Novas funcionalidades disponíveis!"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
          <textarea
            value={novaNotificacao.mensagem}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, mensagem: e.target.value })}
            rows={3}
            placeholder="Digite o conteúdo da notificação..."
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={novaNotificacao.tipo}
              onChange={(e) => setNovaNotificacao({ 
                ...novaNotificacao, 
                tipo: e.target.value as TipoNotificacao 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              <option value="aviso">📢 Aviso</option>
              <option value="alerta">⚠️ Alerta</option>
              <option value="info">ℹ️ Informação</option>
              <option value="sucesso">✅ Sucesso</option>
              <option value="promocao">🎁 Promoção</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Importância</label>
            <select
              value={novaNotificacao.importancia}
              onChange={(e) => setNovaNotificacao({ 
                ...novaNotificacao, 
                importancia: e.target.value as Importancia 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              <option value="baixa">🔵 Informativa</option>
              <option value="media">🟡 Importante</option>
              <option value="alta">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
          <input
            type="url"
            value={novaNotificacao.link_url}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, link_url: e.target.value })}
            placeholder="https://valenteconecta.clic.com.br/pagina"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expira em (opcional)</label>
          <input
            type="date"
            value={novaNotificacao.data_expiracao}
            onChange={(e) => setNovaNotificacao({ ...novaNotificacao, data_expiracao: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
          />
        </div>

        {/* SEÇÃO DE PÚBLICO ALVO */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">🎯 Público alvo:</p>
          
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoAlvo"
                checked={novaNotificacao.tipoAlvo === 'todos'}
                onChange={() => setNovaNotificacao({ ...novaNotificacao, tipoAlvo: 'todos' })}
                className="w-4 h-4 text-indigo-600"
              />
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Todos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoAlvo"
                checked={novaNotificacao.tipoAlvo === 'grupo'}
                onChange={() => setNovaNotificacao({ ...novaNotificacao, tipoAlvo: 'grupo' })}
                className="w-4 h-4 text-indigo-600"
              />
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Grupo específico</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoAlvo"
                checked={novaNotificacao.tipoAlvo === 'usuario'}
                onChange={() => setNovaNotificacao({ ...novaNotificacao, tipoAlvo: 'usuario' })}
                className="w-4 h-4 text-indigo-600"
              />
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Usuário específico</span>
            </label>
          </div>

          {novaNotificacao.tipoAlvo === 'grupo' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o grupo:</label>
              <div className="grid grid-cols-2 gap-2">
                {carregandoGrupos ? (
                  <div className="col-span-2 text-center py-4 text-gray-500">Carregando grupos...</div>
                ) : (
                  grupos.filter(g => g.ativo).map((grupo) => (
                    <button
                      key={grupo.id}
                      type="button"
                      onClick={() => setNovaNotificacao({ ...novaNotificacao, grupoAlvo: grupo.id })}
                      className={`p-3 rounded-xl text-left transition-all ${
                        novaNotificacao.grupoAlvo === grupo.id
                          ? 'bg-indigo-50 border-2 border-indigo-500'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center`} style={{ backgroundColor: grupo.cor }}>
                          {getIconeGrupo(grupo.icone)}
                        </div>
                        <span className="font-medium text-sm">{grupo.nome}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{grupo.descricao}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {novaNotificacao.tipoAlvo === 'usuario' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o usuário:</label>
              <select
                value={novaNotificacao.usuarioAlvo}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, usuarioAlvo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione um usuário...</option>
                {carregandoUsuarios ? (
                  <option disabled>Carregando usuários...</option>
                ) : (
                  usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome} - {usuario.email} {usuario.plano && `(${usuario.plano})`}
                    </option>
                  ))
                )}
              </select>
              {novaNotificacao.usuarioAlvo && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Notificação será enviada apenas para este usuário
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Canais de envio */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">📡 Canais de envio:</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novaNotificacao.enviar_telegram}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, enviar_telegram: e.target.checked })}
                className="w-4 h-4 text-indigo-600"
              />
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Telegram (@valenteconecta_bot)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novaNotificacao.enviar_push}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, enviar_push: e.target.checked })}
                className="w-4 h-4 text-indigo-600"
              />
              <Smartphone className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Push Notification</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novaNotificacao.exibida_uma_vez}
                onChange={(e) => setNovaNotificacao({ ...novaNotificacao, exibida_uma_vez: e.target.checked })}
                className="w-4 h-4 text-indigo-600"
              />
              <Globe className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">Popup única vez</span>
            </label>
          </div>
        </div>
        
        {modoTeste && (
          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
            <p className="text-xs text-yellow-700 flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              <strong>Modo Teste ativado!</strong> As notificações serão enviadas apenas para o grupo de teste.
            </p>
          </div>
        )}
        
        <button
          onClick={onSalvar}
          disabled={enviando}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {enviando ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {editandoId ? "Salvar Alterações" : "Publicar Notificação"}
        </button>
      </div>
    </div>
  );
}

