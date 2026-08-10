// components/admin/automacao/services/selfService.ts
// 🆕 SERVIÇO DE AUTO-CADASTRO

import { Lojista, LojistaStatus, Notificacao } from '../../menu/types';
import { todasRegras } from '../rules/aprovacao';

// ============================================================
// CADASTRO DE LOJISTA (SELF-SERVICE)
// ============================================================

export interface CadastroLojistaInput {
  nome: string;
  email: string;
  telefone: string;
  categoria: string;
  descricao?: string;
  foto?: string;
}

export async function cadastrarLojista(dados: CadastroLojistaInput): Promise<{
  lojista: Lojista;
  notificacao?: Notificacao;
}> {
  // 1. Criar o lojista com status pendente
  const novoLojista: Lojista = {
    id: gerarId(),
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    categoria: dados.categoria,
    status: 'pendente',
    dataCriacao: new Date().toISOString(),
    scoreConfianca: 50, // Score inicial
    totalAvaliacoes: 0,
    avaliacaoMedia: 0,
    denuncias: 0,
    possuiFoto: !!dados.foto,
    descricaoCompleta: !!dados.descricao && dados.descricao.length > 50,
    ultimaAtividade: new Date().toISOString()
  };

  // 2. Aplicar regras de aprovação
  const resultado = await aplicarRegrasAprovacao(novoLojista);

  // 3. Se aprovado automaticamente, atualizar status
  if (resultado.aprovado) {
    novoLojista.status = 'aprovado';
    novoLojista.dataAprovacao = new Date().toISOString();
    
    // Notificar lojista
    await enviarNotificacao({
      tipo: 'aprovacao',
      mensagem: '🎉 Seu cadastro foi aprovado automaticamente!',
      lojistaId: novoLojista.id,
      prioridade: 'baixa'
    });
  }

  // 4. Se não aprovado, notificar admin
  if (!resultado.aprovado) {
    await enviarNotificacao({
      tipo: 'alerta',
      mensagem: `📋 Novo cadastro pendente: ${novoLojista.nome}`,
      lojistaId: novoLojista.id,
      prioridade: 'media'
    });
  }

  // 5. Salvar no banco
  await salvarLojista(novoLojista);

  return {
    lojista: novoLojista,
    notificacao: resultado.notificacao
  };
}

// ============================================================
// APLICAR REGRAS DE APROVAÇÃO
// ============================================================

async function aplicarRegrasAprovacao(lojista: Lojista): Promise<{
  aprovado: boolean;
  notificacao?: Notificacao;
}> {
  // Ordenar regras por prioridade
  const regrasOrdenadas = [...todasRegras].sort((a, b) => a.prioridade - b.prioridade);

  let aprovado = false;
  let notificacao: Notificacao | undefined;

  for (const regra of regrasOrdenadas) {
    if (regra.condicao(lojista)) {
      if (regra.acao === 'aprovar') {
        aprovado = true;
        notificacao = {
          id: gerarId(),
          tipo: 'aprovacao',
          mensagem: `✅ Auto-aprovado pela regra: ${regra.nome}`,
          lojistaId: lojista.id,
          data: new Date().toISOString(),
          lida: false,
          prioridade: 'baixa'
        };
        break;
      }
      
      if (regra.acao === 'suspender') {
        lojista.status = 'suspenso';
        notificacao = {
          id: gerarId(),
          tipo: 'suspensao',
          mensagem: `⚠️ Suspenso pela regra: ${regra.nome}`,
          lojistaId: lojista.id,
          data: new Date().toISOString(),
          lida: false,
          prioridade: 'alta'
        };
        break;
      }
      
      if (regra.acao === 'notificar') {
        notificacao = {
          id: gerarId(),
          tipo: 'alerta',
          mensagem: `⚠️ Atenção: ${regra.nome} para ${lojista.nome}`,
          lojistaId: lojista.id,
          data: new Date().toISOString(),
          lida: false,
          prioridade: 'media'
        };
      }
    }
  }

  return { aprovado, notificacao };
}

// ============================================================
// FUNÇÕES AUXILIARES (SIMULADAS)
// ============================================================

function gerarId(): string {
  return Math.random().toString(36).substring(2, 15);
}

async function salvarLojista(lojista: Lojista): Promise<void> {
  // Simular salvamento no banco
  console.log('💾 Lojista salvo:', lojista);
}

async function enviarNotificacao(notificacao: Partial<Notificacao>): Promise<void> {
  // Simular envio de notificação
  console.log('🔔 Notificação:', notificacao);
}

