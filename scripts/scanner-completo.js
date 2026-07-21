// scripts/scanner-completo.js
const fs = require('fs');
const path = require('path');

const diretorioBase = process.cwd();
const arquivosAnalisados = [];
const ignoreDirs = ['node_modules', '.next', 'dist', 'build'];

function escanearDiretorio(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const caminhoCompleto = path.join(dir, file);
    const stat = fs.statSync(caminhoCompleto);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        escanearDiretorio(caminhoCompleto);
      }
      continue;
    }

    if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      analisarArquivo(caminhoCompleto);
    }
  }
}

function analisarArquivo(caminho) {
  try {
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    const linhas = conteudo.split('\n');
    const problemas = [];

    // 1. Verificar tamanho
    if (linhas.length > 500) {
      problemas.push({
        tipo: 'ALTO',
        descricao: `Arquivo muito grande (${linhas.length} linhas)`,
        sugestao: 'Dividir em componentes menores. Máximo recomendado: 300 linhas'
      });
    }

    if (linhas.length > 800) {
      problemas.push({
        tipo: 'CRÍTICO',
        descricao: `Arquivo extremamente grande (${linhas.length} linhas)`,
        sugestao: 'REFATORAÇÃO URGENTE: Dividir em múltiplos componentes'
      });
    }

    // 2. Verificar erros de tipo comuns
    const erroTipo = conteudo.match(/Type error:.*/g) || [];
    if (erroTipo.length > 0) {
      problemas.push({
        tipo: 'CRÍTICO',
        descricao: `Erro de tipo encontrado: ${erroTipo[0]}`,
        sugestao: 'Corrigir a definição de tipo ou o valor atribuído'
      });
    }

    // 3. Verificar imports quebrados
    const aliasImports = conteudo.match(/from\s+['"]@\/[^'"]+['"]/g) || [];
    for (const imp of aliasImports) {
      const caminhoImport = imp.match(/@\/([^'"]+)/)?.[1];
      if (caminhoImport) {
        const caminhoAbsoluto = path.join(diretorioBase, caminhoImport);
        if (!fs.existsSync(caminhoAbsoluto) && 
            !fs.existsSync(caminhoAbsoluto + '.tsx') && 
            !fs.existsSync(caminhoAbsoluto + '.ts') &&
            !fs.existsSync(caminhoAbsoluto + '.jsx') &&
            !fs.existsSync(caminhoAbsoluto + '.js')) {
          problemas.push({
            tipo: 'CRÍTICO',
            descricao: `Import quebrado: ${imp}`,
            sugestao: `Verificar se o arquivo "${caminhoImport}" existe`
          });
        }
      }
    }

    // 4. Verificar export default
    const temExportDefault = conteudo.includes('export default');

    // 5. Verificar uso de 'any'
    const anyUsages = conteudo.match(/:\s*any/g) || [];
    if (anyUsages.length > 0) {
      problemas.push({
        tipo: 'MÉDIO',
        descricao: `Uso de 'any' ${anyUsages.length} vezes`,
        sugestao: 'Substituir por tipos específicos'
      });
    }

    arquivosAnalisados.push({
      caminho: caminho.replace(diretorioBase, '.'),
      linhas: linhas.length,
      tamanho: fs.statSync(caminho).size,
      temExportDefault,
      problemas
    });
  } catch (error) {
    console.error(`Erro ao analisar ${caminho}:`, error.message);
  }
}

function gerarRelatorio() {
  console.log('\n📊 RELATÓRIO DO SCANNER 2.0');
  console.log('========================================\n');

  const ordenados = [...arquivosAnalisados].sort((a, b) => b.problemas.length - a.problemas.length);
  const totalArquivos = arquivosAnalisados.length;
  const arquivosComProblemas = arquivosAnalisados.filter(a => a.problemas.length > 0);
  const totalProblemas = arquivosAnalisados.reduce((acc, a) => acc + a.problemas.length, 0);

  console.log(`📁 Total de arquivos analisados: ${totalArquivos}`);
  console.log(`⚠️ Arquivos com problemas: ${arquivosComProblemas.length}`);
  console.log(`🔴 Total de problemas: ${totalProblemas}\n`);

  // Separar por prioridade
  const criticos = arquivosComProblemas.filter(a => a.problemas.some(p => p.tipo === 'CRÍTICO'));
  const altos = arquivosComProblemas.filter(a => a.problemas.some(p => p.tipo === 'ALTO'));

  console.log(`🔴 Problemas CRÍTICOS: ${criticos.length} arquivos`);
  console.log(`🟠 Problemas de ALTA prioridade: ${altos.length} arquivos\n`);

  // Mostrar arquivos críticos
  if (criticos.length > 0) {
    console.log('🔴 ARQUIVOS COM PROBLEMAS CRÍTICOS:\n');
    criticos.forEach((arquivo, index) => {
      console.log(`${index + 1}. ${arquivo.caminho}`);
      console.log(`   Linhas: ${arquivo.linhas}`);
      arquivo.problemas.filter(p => p.tipo === 'CRÍTICO').forEach(p => {
        console.log(`   ❌ ${p.descricao}`);
        console.log(`   💡 ${p.sugestao}`);
      });
      console.log('');
    });
  }

  // Gerar arquivo de relatório
  const relatorioPath = path.join(diretorioBase, 'RELATORIO_SCANNER.md');
  let relatorio = `# 🔍 RELATÓRIO DO SCANNER 2.0 - VALENTE CONECTA\n\n`;
  relatorio += `**Data:** ${new Date().toLocaleString()}\n\n`;
  relatorio += `## 📊 Estatísticas Gerais\n\n`;
  relatorio += `- Total de arquivos analisados: ${totalArquivos}\n`;
  relatorio += `- Arquivos com problemas: ${arquivosComProblemas.length}\n`;
  relatorio += `- Total de problemas: ${totalProblemas}\n\n`;

  relatorio += `## 🔴 Problemas CRÍTICOS (${criticos.length})\n\n`;
  criticos.forEach(a => {
    relatorio += `### ${a.caminho}\n`;
    relatorio += `- Linhas: ${a.linhas}\n\n`;
    a.problemas.filter(p => p.tipo === 'CRÍTICO').forEach(p => {
      relatorio += `**Erro:** ${p.descricao}\n`;
      relatorio += `**Solução:** ${p.sugestao}\n\n`;
    });
    relatorio += '---\n\n';
  });

  relatorio += `## 🟠 Problemas de ALTA Prioridade (${altos.length})\n\n`;
  altos.forEach(a => {
    relatorio += `### ${a.caminho}\n`;
    relatorio += `- Linhas: ${a.linhas}\n\n`;
    a.problemas.filter(p => p.tipo === 'ALTO').forEach(p => {
      relatorio += `**Problema:** ${p.descricao}\n`;
      relatorio += `**Solução:** ${p.sugestao}\n\n`;
    });
    relatorio += '---\n\n';
  });

  fs.writeFileSync(relatorioPath, relatorio);
  console.log(`\n✅ Relatório salvo em: ${relatorioPath}`);
}

// Executar
console.log('🔍 INICIANDO SCANNER 2.0 DO VALENTE CONECTA');
console.log('============================================\n');

escanearDiretorio(diretorioBase);
gerarRelatorio();