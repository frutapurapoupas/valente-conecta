import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ============================================
// BUSCA INTELIGENTE - API COMPLETA
// ============================================
// 1. Busca em catÃ¡logos locais (profissionais, lojas, mototaxi)
// 2. Agrupamento por produto/nome
// 3. Fallback internet (Google) com 3 resultados
// 4. Aplicar borramento se usuÃ¡rio nÃ£o tem plano pago
// 5. Registrar pendÃªncia no admin se nÃ£o encontrar

interface LocalProduct {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem?: string;
  categoria: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEndereco?: string;
  usuarioTelefone?: string;
  usuarioPlano?: string;
  usuarioLocalizacao?: { lat: number; lng: number };
  localidade?: string;
}

interface GroupedProduct {
  nome: string;
  preco: number;
  descricao: string;
  imagem?: string;
  categoria: string;
  locations: LocalProduct[];
  isGrouped: boolean;
  totalLocations: number;
}

// Ler dados de usuÃ¡rios com seus produtos
function lerDadosLocais(): LocalProduct[] {
  const produtos: LocalProduct[] = [];

  try {
    // === PROFISSIONAIS ===
    const profissionaisPath = path.join(process.cwd(), 'data', 'profissionais.json');
    if (fs.existsSync(profissionaisPath)) {
      const profissionais = JSON.parse(fs.readFileSync(profissionaisPath, 'utf8'));
      profissionais.forEach((prof: any) => {
        if (prof.servicos && Array.isArray(prof.servicos)) {
          prof.servicos.forEach((servico: any) => {
            produtos.push({
              id: `prof-${prof.id}-${servico.id}`,
              nome: servico.nome || prof.nome,
              descricao: servico.descricao || prof.descricao || '',
              preco: servico.preco || 0,
              imagem: servico.foto || prof.foto,
              categoria: 'profissionais',
              usuarioId: prof.id,
              usuarioNome: prof.nome,
              usuarioEndereco: prof.endereco || 'EndereÃ§o nÃ£o informado',
              usuarioTelefone: prof.telefone || 'Telefone nÃ£o informado',
              usuarioPlano: prof.plano || 'gratis',
              usuarioLocalizacao: prof.localizacao,
              localidade: prof.localidade || 'Valente, BA'
            });
          });
        }
      });
    }

    // === CATÃLOGO COMERCIAL ===
    const catalogoPath = path.join(process.cwd(), 'data', 'catalogo.json');
    if (fs.existsSync(catalogoPath)) {
      const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));
      catalogo.forEach((item: any) => {
        produtos.push({
          id: `catalogo-${item.id}`,
          nome: item.nome,
          descricao: item.descricao || '',
          preco: item.preco || 0,
          imagem: item.foto, // CORRIGIDO: adicionado ponto
          categoria: item.categoria || 'comercial',
          usuarioId: item.vendedorId,
          usuarioNome: item.vendedorNome,
          usuarioEndereco: item.endereco || 'EndereÃ§o nÃ£o informado',
          usuarioTelefone: item.telefone || 'Telefone nÃ£o informado',
          usuarioPlano: item.vendedorPlano || 'gratis',
          usuarioLocalizacao: item.localizacao,
          localidade: item.localidade || 'Valente, BA'
        });
      });
    }

    // === MOTOTAXI / TRANSPORTE ===
    const mototaxiPath = path.join(process.cwd(), 'data', 'mototaxi.json');
    if (fs.existsSync(mototaxiPath)) {
      const mototaxis = JSON.parse(fs.readFileSync(mototaxiPath, 'utf8'));
      mototaxis.forEach((taxi: any) => {
        if (taxi.servicos && Array.isArray(taxi.servicos)) {
          taxi.servicos.forEach((servico: any) => {
            produtos.push({
              id: `taxi-${taxi.id}-${servico}`,
              nome: servico,
              descricao: 'ServiÃ§o de transporte',
              preco: taxi.precoBase || 15,
              imagem: taxi.foto,
              categoria: 'transporte',
              usuarioId: taxi.id,
              usuarioNome: taxi.nome,
              usuarioEndereco: taxi.endereco || 'EndereÃ§o nÃ£o informado',
              usuarioTelefone: taxi.telefone || 'Telefone nÃ£o informado',
              usuarioPlano: taxi.plano || 'gratis',
              usuarioLocalizacao: taxi.localizacao,
              localidade: 'Valente, BA'
            });
          });
        }
      });
    }

    // === LOJAS VIRTUAIS ===
    const lojasPath = path.join(process.cwd(), 'data', 'lojas.json');
    if (fs.existsSync(lojasPath)) {
      const lojas = JSON.parse(fs.readFileSync(lojasPath, 'utf8'));
      lojas.forEach((loja: any) => {
        if (loja.produtos && Array.isArray(loja.produtos)) {
          loja.produtos.forEach((produto: any) => {
            produtos.push({
              id: `loja-${loja.id}-${produto.id}`,
              nome: produto.nome,
              descricao: produto.descricao || '',
              preco: produto.preco || 0,
              imagem: produto.imagem,
              categoria: loja.categoria || 'comercio',
              usuarioId: loja.id,
              usuarioNome: loja.nome,
              usuarioEndereco: loja.endereco || 'EndereÃ§o nÃ£o informado',
              usuarioTelefone: loja.telefone || 'Telefone nÃ£o informado',
              usuarioPlano: loja.plano || 'gratis',
              usuarioLocalizacao: loja.localizacao,
              localidade: 'Valente, BA'
            });
          });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao ler dados locais:', error);
  }

  return produtos;
}

// Filtrar e agrupar produtos por nome
function filtrarEAgrupar(
  produtos: LocalProduct[],
  termo: string,
  userLocalizacao?: { lat: number; lng: number }
): GroupedProduct[] {
  const termoNormalized = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const filtered = produtos.filter(p => {
    const nomeNorm = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const descNorm = (p.descricao || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return nomeNorm.includes(termoNormalized) || descNorm.includes(termoNormalized);
  });

  // Agrupar por nome do produto
  const grouped = new Map<string, LocalProduct[]>();
  filtered.forEach(p => {
    const chave = p.nome.toLowerCase();
    if (!grouped.has(chave)) {
      grouped.set(chave, []);
    }
    grouped.get(chave)!.push(p);
  });

  // Converter para array de produtos agrupados
  const resultado: GroupedProduct[] = Array.from(grouped.entries()).map(([nome, locations]) => ({
    nome: locations[0].nome, // Use o nome original do primeiro item
    preco: Math.min(...locations.map(l => l.preco)), // PreÃ§o mÃ­nimo
    descricao: locations[0].descricao,
    imagem: locations[0].imagem,
    categoria: locations[0].categoria,
    locations, // Todos os locais
    isGrouped: locations.length > 1,
    totalLocations: locations.length
  }));

  return resultado;
}

// Aplicar regras de borramento baseado em plano
function aplicarBorramento(produtos: GroupedProduct[], desbloqueados: string[] = []): GroupedProduct[] {
  return produtos.map(produto => ({
    ...produto,
    locations: produto.locations.map(loc => {
      const precisaBloquear = loc.usuarioPlano === 'gratis' && !desbloqueados.includes(loc.id);
      
      return {
        ...loc,
        usuarioEndereco: precisaBloquear ? '*** Desbloqueie para ver endereÃ§o ***' : loc.usuarioEndereco,
        usuarioTelefone: precisaBloquear ? '*** Desbloqueie para ver telefone ***' : loc.usuarioTelefone,
        usuarioLocalizacao: precisaBloquear ? undefined : loc.usuarioLocalizacao
      };
    })
  }));
}

// Buscar 3 resultados na internet (simulado com Google)
async function buscarInternet(termo: string): Promise<any[]> {
  // Em produÃ§Ã£o, usar Google Custom Search API ou similar
  // Por enquanto, retornar array vazio com mensagem de registro
  return [
    {
      id: `internet-1-${Date.now()}`,
      nome: `${termo} - Resultado 1`,
      descricao: 'Resultado de busca na internet',
      preco: 0,
      categoria: 'internet',
      linkExterno: `https://www.google.com/search?q=${encodeURIComponent(termo + ' Valente BA')}`,
      usuarioNome: 'Google',
      origem: 'internet'
    },
    {
      id: `internet-2-${Date.now()}`,
      nome: `${termo} - Resultado 2`,
      descricao: 'Resultado de busca na internet',
      preco: 0,
      categoria: 'internet',
      linkExterno: `https://www.google.com/search?q=${encodeURIComponent(termo)}`,
      usuarioNome: 'Google',
      origem: 'internet'
    },
    {
      id: `internet-3-${Date.now()}`,
      nome: `${termo} - Resultado 3`,
      descricao: 'Resultado de busca na internet',
      preco: 0,
      categoria: 'internet',
      linkExterno: `https://www.google.com/search?q=${encodeURIComponent(termo + ' preÃ§o')}`,
      usuarioNome: 'Google',
      origem: 'internet'
    }
  ];
}

// Registrar pendÃªncia no admin
function registrarPendencia(termo: string, userId: string, localizacao?: { lat: number; lng: number }) {
  try {
    const demandasPath = path.join(process.cwd(), 'data', 'demandas_busca.json');
    let demandas: any[] = [];

    if (fs.existsSync(demandasPath)) {
      demandas = JSON.parse(fs.readFileSync(demandasPath, 'utf8'));
    }

    // CORRIGIDO: Certifique-se de que todos os campos estÃ£o definidos corretamente
    const novaDemanda = {
      id: `demanda-${Date.now()}`,
      termo,
      userId,
      localizacao: localizacao || null, // Usar null se nÃ£o tiver localizaÃ§Ã£o
      status: 'pendente',
      criadoEm: new Date().toISOString(),
      respondidoEm: null,
      resposta: null
    };

    // Verificar tipo antes de adicionar
    console.log('Registrando demanda:', novaDemanda);
    
    demandas.push(novaDemanda);
    fs.writeFileSync(demandasPath, JSON.stringify(demandas, null, 2));
  } catch (error) {
    console.error('Erro ao registrar pendÃªncia:', error);
  }
}

// ============================================
// ROTA GET - BUSCA
// ============================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const termo = searchParams.get('q')?.trim() || '';
    const userId = searchParams.get('userId') || '';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const desbloqueados = searchParams.getAll('desbloqueados[]') || [];

    if (!termo || termo.length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Termo de busca invÃ¡lido'
      });
    }

    // Ler produtos locais
    const produtosLocais = lerDadosLocais();

    // Filtrar e agrupar
    const agrupados = filtrarEAgrupar(produtosLocais, termo);

    // Aplicar borramento
    const comBorramento = aplicarBorramento(agrupados, desbloqueados);

    // Se encontrar localmente, retornar
    if (comBorramento.length > 0) {
      return NextResponse.json({
        success: true,
        produtos: comBorramento,
        origem: 'local',
        totalLocal: comBorramento.length,
        mensagem: `${comBorramento.length} resultado(s) encontrado(s) em Valente, BA`
      });
    }

    // Se nÃ£o encontrar, registrar demanda e retornar fallback internet
    registrarPendencia(termo, userId, lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined);

    const resultadosInternet = await buscarInternet(termo);

    return NextResponse.json({
      success: true,
      produtos: resultadosInternet,
      origem: 'internet',
      totalLocal: 0,
      mensagem: `Nenhum resultado em Valente, BA. Mostrando resultados da internet.`,
      demandaRegistrada: true,
      demandaMensagem: `Sua busca por "${termo}" foi registrada! VocÃª receberÃ¡ uma notificaÃ§Ã£o quando um produto for encontrado ou adicionado em atÃ© 24 horas.`
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar busca' },
      { status: 500 }
    );
  }
}

