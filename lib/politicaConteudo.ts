// Caminho: C:\valente_conecta\lib\politicaConteudo.ts
//
// Texto e versao da politica de protecao de conteudo que todo usuario
// geral precisa aceitar antes de publicar algo no app (vaga de emprego,
// classificado, curriculo etc. -- qualquer insercao de conteudo feita por
// ele mesmo). Pra pedir aceite de novo de todo mundo, so' mude o texto E
// incremente POLITICA_CONTEUDO_VERSAO -- quem ja aceitou uma versao mais
// velha volta a ver o popup na proxima publicacao (ver
// lib/hooks/useExigirAceitePolitica.ts e 090_politica_conteudo_aceite.sql).

export const POLITICA_CONTEUDO_VERSAO = 1;

export const POLITICA_CONTEUDO_TITULO = "Política de Proteção de Conteúdo";

export const POLITICA_CONTEUDO_TEXTO = `Antes de publicar, leia com atenção:

O Valente Conecta é um espaço pra conectar pessoas e negócios de Valente e região — e para isso continuar sendo seguro pra todo mundo, é proibido publicar (em anúncios, classificados, currículos, fotos, descrições ou qualquer outro conteúdo que você enviar):

• Itens roubados, furtados ou de origem duvidosa;
• Armas, munições, drogas ilícitas ou qualquer substância proibida por lei;
• Produtos falsificados ou pirateados;
• Conteúdo de exploração, abuso ou qualquer forma de violência contra crianças e adolescentes;
• Discurso de ódio, discriminação ou incitação à violência contra qualquer pessoa ou grupo;
• Golpes, esquemas de fraude ou promessas enganosas de emprego/renda;
• Dados pessoais de terceiros publicados sem autorização;
• Qualquer outro conteúdo que configure crime previsto em lei.

Você é o único responsável pelo que publica. O Valente Conecta pode remover qualquer conteúdo que viole esta política, suspender ou banir sua conta, e colaborar com as autoridades quando houver indício de crime.

Ao continuar, você confirma que leu esta política e se compromete a publicar apenas conteúdo lícito.`;
