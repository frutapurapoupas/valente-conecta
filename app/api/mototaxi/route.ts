// Caminho sugerido: C:\valente_conecta\app\api\mototaxi\route.ts
// Substitui a versão anterior baseada em arquivo JSON local (incompatível com Vercel).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verificarECConsumirPlanoGeral } from '@/lib/planoGeral';
import { calcularERegistrarTaxasDaCorrida } from '@/lib/mototaxi/taxaUso';

function validarMotoristaPayload(payload: any) {
  const obrigatorios = ['nome', 'telefone', 'veiculo', 'placa', 'cnh_numero', 'licenciamento_vencimento', 'foto_url', 'veiculo_foto_url', 'cnh_foto_url'];
  for (const campo of obrigatorios) {
    if (!payload?.[campo]) return `Campo obrigatorio ausente: ${campo}`;
  }
  const licDate = new Date(payload.licenciamento_vencimento);
  if (Number.isNaN(licDate.getTime())) return 'Data de vencimento do licenciamento invalida.';
  if (licDate.getTime() < Date.now()) return 'Licenciamento vencido. Regularize para cadastrar.';
  if (!payload?.cnh_valida) return 'CNH invalida. Nao e possivel concluir cadastro.';
  if (!payload?.documento_veiculo_ok) return 'Documentacao do veiculo invalida.';
  if (!payload?.aceitou_termos_motorista) return 'E preciso aceitar o Termo de Uso e Condicoes de Parceria.';
  if (!payload?.aceitou_limitacao_responsabilidade) return 'E preciso aceitar os Termos de Limitacao de Responsabilidade.';
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const recurso = searchParams.get('recurso') || 'motoristas';

    if (recurso === 'motoristas') {
      let query = supabase.from('mototaxi_motoristas').select('*').order('nome');
      if (searchParams.get('online') === 'true') query = query.eq('online', true);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'corridas') {
      let query = supabase.from('mototaxi_corridas').select('*').order('created_at', { ascending: false });
      const status = searchParams.get('status');
      const motoristaId = searchParams.get('motorista_id');
      const passageiroId = searchParams.get('passageiro_id');
      const corridaId = searchParams.get('corrida_id');
      if (status) query = query.eq('status', status);
      if (motoristaId) query = query.eq('motorista_id', motoristaId);
      if (passageiroId) query = query.eq('passageiro_id', passageiroId);
      if (corridaId) query = query.eq('id', corridaId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'ads') {
      const { data, error } = await supabase.from('mototaxi_ads_config').select('*').limit(1).single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'cidades') {
      const { data, error } = await supabase.from('cidades').select('*').eq('ativa', true).order('nome');
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'ponto_referencia') {
      const cidadeId = searchParams.get('cidade_id');
      const texto = (searchParams.get('q') || '').trim().toLowerCase();
      if (!cidadeId || !texto) {
        return NextResponse.json({ success: true, data: null });
      }

      const { data, error } = await supabase
        .from('pontos_referencia')
        .select('*')
        .eq('cidade_id', cidadeId)
        .eq('ativo', true);

      if (error) throw error;

      const encontrado = (data || []).find((ponto) => {
        const nomeMatch = ponto.nome.toLowerCase().includes(texto) || texto.includes(ponto.nome.toLowerCase());
        const apelidoMatch = (ponto.apelidos || []).some((a: string) => texto.includes(a.toLowerCase()) || a.toLowerCase().includes(texto));
        return nomeMatch || apelidoMatch;
      });

      return NextResponse.json({ success: true, data: encontrado || null });
    }

    if (recurso === 'autocomplete') {
      const cidadeId = searchParams.get('cidade_id');
      const texto = (searchParams.get('q') || '').trim();

      if (!cidadeId || texto.length < 2) {
        return NextResponse.json({ success: true, data: [] });
      }

      // 1. Pontos de referencia locais (prioridade — nomes/apelidos conhecidos)
      const { data: pontos } = await supabase
        .from('pontos_referencia')
        .select('id, nome, latitude, longitude')
        .eq('cidade_id', cidadeId)
        .eq('ativo', true)
        .ilike('nome', `%${texto}%`)
        .limit(5);

      const sugestoesLocais = (pontos || []).map((p) => ({
        id: `local_${p.id}`,
        texto: p.nome,
        lat: p.latitude,
        lng: p.longitude,
        origem: 'local' as const,
      }));

      // 2. Se ja tiver 5 sugestoes locais suficientes, nao precisa consultar o Nominatim
      if (sugestoesLocais.length >= 5) {
        return NextResponse.json({ success: true, data: sugestoesLocais });
      }

      // 3. Busca a cidade para restringir o Nominatim ao raio dela
      const { data: cidade } = await supabase
        .from('cidades')
        .select('centro_lat, centro_lng, raio_km')
        .eq('id', cidadeId)
        .single();

      let sugestoesNominatim: any[] = [];
      if (cidade) {
        const grausPorKm = 1 / 111;
        const delta = Number(cidade.raio_km) * grausPorKm;
        const viewbox = `${cidade.centro_lng - delta},${cidade.centro_lat + delta},${cidade.centro_lng + delta},${cidade.centro_lat - delta}`;

        try {
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=4&countrycodes=br&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(texto)}`;
          const res = await fetch(url, { headers: { 'User-Agent': 'ValenteConecta/1.0' } });
          const data = await res.json();
          sugestoesNominatim = (Array.isArray(data) ? data : []).map((d: any) => ({
            id: `osm_${d.place_id}`,
            texto: d.display_name,
            lat: Number(d.lat),
            lng: Number(d.lon),
            origem: 'mapa' as const,
          }));
        } catch {
          sugestoesNominatim = [];
        }
      }

      return NextResponse.json({
        success: true,
        data: [...sugestoesLocais, ...sugestoesNominatim].slice(0, 6),
      });
    }

    if (recurso === 'metrics') {
      const hoje = new Date().toISOString().slice(0, 10);
      const [{ data: motoristas }, { data: corridas }] = await Promise.all([
        supabase.from('mototaxi_motoristas').select('*'),
        supabase.from('mototaxi_corridas').select('*'),
      ]);

      const listaMotoristas = motoristas || [];
      const listaCorridas = corridas || [];
      const corridasHoje = listaCorridas.filter((r) => String(r.created_at).slice(0, 10) === hoje);
      const concluidasHoje = corridasHoje.filter((r) => r.status === 'concluida');
      const concluidas = listaCorridas.filter((r) => r.status === 'concluida');
      const receitaHoje = concluidasHoje.reduce((soma, r) => soma + Number(r.preco || 0), 0);
      const ticketMedio = concluidas.length
        ? concluidas.reduce((soma, r) => soma + Number(r.preco || 0), 0) / concluidas.length
        : 0;

      const limiar = Date.now() + 1000 * 60 * 60 * 24 * 30;
      const alertasDoc = listaMotoristas.filter((m) => {
        const lic = new Date(m.licenciamento_vencimento || 0).getTime();
        return !m.cnh_valida || !m.documento_veiculo_ok || lic < limiar;
      }).length;

      return NextResponse.json({
        success: true,
        data: {
          totalMotoristas: listaMotoristas.length,
          motoristasAtivos: listaMotoristas.filter((m) => m.online).length,
          corridasHoje: corridasHoje.length,
          emAndamento: listaCorridas.filter((r) => r.status === 'em_andamento').length,
          concluidasHoje: concluidasHoje.length,
          pagamentoPendente: listaCorridas.filter((r) => r.status_pagamento === 'pendente').length,
          receitaHoje,
          ticketMedio: Number(ticketMedio.toFixed(2)),
          alertasDoc,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro GET mototaxi:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const recurso = body?.recurso;

    if (recurso === 'motoristas') {
      const erro = validarMotoristaPayload(body);
      if (erro) return NextResponse.json({ success: false, error: erro }, { status: 400 });

      const { data, error } = await supabase
        .from('mototaxi_motoristas')
        .insert([{
          nome: body.nome,
          telefone: body.telefone,
          foto_url: body.foto_url || null,
          veiculo_foto_url: body.veiculo_foto_url || null,
          cnh_foto_url: body.cnh_foto_url || null,
          veiculo: body.veiculo,
          placa: String(body.placa).toUpperCase(),
          plano: body.plano || 'gratis',
          online: Boolean(body.online ?? false),
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
          cnh_numero: body.cnh_numero,
          cnh_valida: Boolean(body.cnh_valida),
          documento_veiculo_ok: Boolean(body.documento_veiculo_ok),
          licenciamento_vencimento: body.licenciamento_vencimento,
          aceitou_termos_motorista_em: new Date().toISOString(),
          aceitou_limitacao_responsabilidade_em: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Passageiro solicita corrida — SEM motorista definido ainda.
    // Fica em 'aguardando_motorista' ate algum motorista aceitar.
    if (recurso === 'corridas') {
      const obrigatorios = ['passageiro_nome', 'origem', 'destino', 'origem_lat', 'origem_lng', 'destino_lat', 'destino_lng', 'preco'];
      for (const campo of obrigatorios) {
        if (body?.[campo] === undefined || body?.[campo] === null || body?.[campo] === '') {
          return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
        }
      }

      if (body.passageiro_id) {
        const cota = await verificarECConsumirPlanoGeral(body.passageiro_id, 'mototaxi');
        if (!cota.permitido) {
          return NextResponse.json(
            { success: false, limiteAtingido: true, tier: cota.tier, error: 'Você atingiu seu limite mensal de corridas/encomendas pro seu plano.' },
            { status: 402 }
          );
        }
      }

      const { data, error } = await supabase
        .from('mototaxi_corridas')
        .insert([{
          passageiro_id: body.passageiro_id || null,
          passageiro_nome: body.passageiro_nome,
          passageiro_plano: body.passageiro_plano || 'gratis',
          cidade_id: body.cidade_id || null,
          motorista_id: null,
          tipo: body.tipo === 'encomenda' ? 'encomenda' : 'passageiro',
          encomenda_descricao: body.encomenda_descricao || null,
          destinatario_nome: body.destinatario_nome || null,
          destinatario_telefone: body.destinatario_telefone || null,
          origem: body.origem,
          destino: body.destino,
          origem_lat: body.origem_lat,
          origem_lng: body.origem_lng,
          destino_lat: body.destino_lat,
          destino_lng: body.destino_lng,
          preco: body.preco,
          metodo_pagamento: body.metodo_pagamento || 'pix',
          status: 'aguardando_motorista',
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro POST mototaxi:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao salvar.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const recurso = body?.recurso;

    // Motorista aceita uma corrida pendente.
    // Trava por concorrencia: so aceita se ainda estiver 'aguardando_motorista'.
    if (recurso === 'corrida_aceitar') {
      const { corridaId, motoristaId, motoristaLat, motoristaLng } = body;

      const { data, error } = await supabase
        .from('mototaxi_corridas')
        .update({
          motorista_id: motoristaId,
          motorista_lat: motoristaLat,
          motorista_lng: motoristaLng,
          status: 'aceita',
          updated_at: new Date().toISOString(),
        })
        .eq('id', corridaId)
        .eq('status', 'aguardando_motorista') // evita dois motoristas aceitando a mesma corrida
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ success: false, error: 'Corrida ja foi aceita por outro motorista ou nao existe mais.' }, { status: 409 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'corrida_status') {
      const { corridaId, status, statusPagamento } = body;
      const patch: any = { updated_at: new Date().toISOString() };
      if (status) patch.status = status;
      if (statusPagamento) patch.status_pagamento = statusPagamento;

      const { data, error } = await supabase
        .from('mototaxi_corridas')
        .update(patch)
        .eq('id', corridaId)
        .select()
        .single();

      if (error) throw error;

      // Taxa de uso da plataforma (ver lib/mototaxi/taxaUso.ts) -- so' calcula
      // quando a corrida vira 'concluida'. Precisa de await mesmo: em
      // ambiente serverless (Vercel) uma chamada sem await pode ser
      // encerrada no meio assim que a resposta e' enviada, e o trabalho em
      // segundo plano nunca termina (confirmado testando em producao -- sem
      // await, a taxa nunca era gravada). A funcao em si ja nunca lanca erro
      // pra fora, entao isso nao derruba a conclusao da corrida.
      if (status === 'concluida') {
        await calcularERegistrarTaxasDaCorrida(corridaId);
      }

      return NextResponse.json({ success: true, data });
    }

    // Atualiza a localizacao real do motorista (chamado periodicamente pela
    // tela do motorista via navigator.geolocation.watchPosition).
    if (recurso === 'motorista_localizacao') {
      const { motoristaId, latitude, longitude, corridaId } = body;

      await supabase
        .from('mototaxi_motoristas')
        .update({ latitude, longitude, updated_at: new Date().toISOString() })
        .eq('id', motoristaId);

      if (corridaId) {
        await supabase
          .from('mototaxi_corridas')
          .update({ motorista_lat: latitude, motorista_lng: longitude, updated_at: new Date().toISOString() })
          .eq('id', corridaId);
      }

      return NextResponse.json({ success: true });
    }

    if (recurso === 'motorista') {
      const { id, patch } = body;
      const { data, error } = await supabase
        .from('mototaxi_motoristas')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'ads') {
      const { data: atual } = await supabase.from('mototaxi_ads_config').select('id').limit(1).single();
      const { data, error } = await supabase
        .from('mototaxi_ads_config')
        .update({ ...body.config, updated_at: new Date().toISOString() })
        .eq('id', atual?.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro PUT mototaxi:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao atualizar.' }, { status: 500 });
  }
}