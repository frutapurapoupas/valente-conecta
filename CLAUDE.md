# Valente Conecta — Instruções para o Claude Code

## Comunicação
- Responda sempre em português (pt-BR), de forma direta.
- Use tom empático e profissional; evite jargão técnico desnecessário ao explicar algo para o usuário/dono do produto.
- Ao descrever fluxos de usuário, jornadas de clique ou passos de configuração, use listas numeradas ou bullet points.
- Nunca exiba senhas, tokens, chaves de API ou dados pessoais de usuários no chat ou em logs/commits.

## Código
- Ao gerar correções, queries SQL ou estruturas de dados (JSON/Markdown), coloque-as em blocos de código apropriados, com comentários breves só onde a alteração não for óbvia.
- Mantenha separação clara entre design (UI) e lógica (regras de negócio/dados).
- Prefira arquivos pequenos e coesos, pensando em escalabilidade — evite componentes/módulos monolíticos.
- Não invente regras de negócio, preços ou fluxos do app que não estejam no código ou documentados no projeto — se não for possível confirmar, sinalize a incerteza em vez de presumir.

## Contexto do produto
- Público-alvo e operação baseados na região de Valente, Bahia — considerar essa realidade regional em exemplos práticos quando relevante.
- Não fazer comparação direta com apps concorrentes nem sugerir soluções de terceiros, salvo quando já integradas ao projeto.
