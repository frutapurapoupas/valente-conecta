# Valentinha AI - Gerador de Vídeos Automatizados

Sistema de geração de vídeos curtos para divulgação do app Valente Conecta, featuring a Valentinha como avatar.

## 📁 Estrutura de Pastas

```
valentinha-ai/
├── input/          # Imagens do avatar da Valentinha
├── roteiros/       # Roteiros gerados (txt e json)
├── audio/          # Arquivos de áudio gerados
├── video/          # Vídeos renderizados
├── final/          # Vídeos finais com legenda
├── config.json     # Configurações do sistema
├── gerar_roteiro.py # Script para geração de roteiros
├── gerar_audio.py  # Script para geração de áudio
├── gerar_video.py  # Script para renderização de vídeo
└── pipeline.py     # Pipeline principal
```

## 🔧 Pré-requisitos

### 1. Python 3.8+
```bash
python --version
```

### 2. FFmpeg
- Download: https://ffmpeg.org/download.html
- Adicionar ao PATH do sistema
- Verificar: `ffmpeg -version`

### 3. Piper TTS (opcional, recomendado)
- Instalação: https://github.com/rhasspy/piper
- Modelo pt-BR feminino: baixar do repositório oficial

### 4. gTTS (alternativa gratuita)
```bash
pip install gtts
```

### 5. Bibliotecas Python
```bash
pip install requests gtts
```

## ⚙️ Configuração

Edite `config.json`:

```json
{
  "deepseek": {
    "api_key": "SUA_API_KEY_AQUI",
    "model": "deepseek-chat",
    "base_url": "https://api.deepseek.com/v1"
  },
  "piper": {
    "model_path": "caminho/para/piper",
    "voice": "pt_BR-female-medium"
  },
  "ffmpeg": {
    "path": "ffmpeg",
    "output_format": "mp4",
    "video_codec": "libx264",
    "audio_codec": "aac",
    "resolution": "1080x1920"
  },
  "valentinha": {
    "avatar_path": "input/valentinha.png",
    "style": "energetic",
    "tone": "friendly"
  }
}
```

## 🚀 Uso

### Pipeline Completo
```bash
python pipeline.py "academia IA"
```

### Etapas Individuais

#### 1. Gerar Roteiro
```bash
python gerar_roteiro.py "academia IA"
```

#### 2. Gerar Áudio
```bash
python gerar_audio.py roteiros/academia_IA_20240426.json
```

#### 3. Gerar Vídeo
```bash
python gerar_video.py audio/audio.wav roteiros/academia_IA_20240426.json
```

## 📝 Calendário de Conteúdos

### Semana 1: Academia IA
- Segunda: Dashboard IA - Score de Recuperação
- Terça: Plano de Treino Personalizado
- Quarta: Recomendações Inteligentes
- Quinta: Monitoramento em Tempo Real
- Sexta: Metas e Progresso
- Sábado: Dicas de Treino
- Domingo: Descanso e Recuperação

### Semana 2: Indique e Ganhe
- Segunda: Como Funciona o Sistema de Indicação
- Terça: Bônus por Amigo Indicado
- Quarta: Rastreamento de Indicações
- Quinta: Saques de Bônus
- Sexta: Ranking de Indicadores
- Sábado: Estratégias de Indicação
- Domingo: Sucesso Stories

### Semana 3: PDV
- Segunda: Scanner de Código de Barras
- Terça: Venda Fiado
- Quarta: Gestão de Estoque
- Quinta: Relatórios Financeiros
- Sexta: Modo Colaborativo
- Sábado: Integração com ERP
- Domingo: Dicas de Venda

### Semana 4: Veículos
- Segunda: Aluguel de Veículos
- Terça: Venda de Carros
- Quarta: Venda de Motos
- Quinta: Caminhões e Vans
- Sexta: Comparação de Preços
- Sábado: Financiamento
- Domingo: Dicas de Compra

### Semana 5: Empregos
- Segunda: Cadastro de Currículo
- Terça: Busca de Vagas
- Quarta: Pagamento PIX
- Quinta: Candidatos Disponíveis
- Sexta: Empresas Cadastradas
- Sábado: Dicas de Entrevista
- Domingo: Sucesso Profissional

## 🎨 Avatar da Valentinha

Coloque uma imagem da Valentinha em `input/valentinha.png`

Recomendações:
- Formato: PNG com fundo transparente
- Resolução: 1080x1080 ou superior
- Estilo: Amigável, energético, profissional
- Cores: Usar paleta do app Valente Conecta

## 📱 Distribuição

Após gerar o vídeo:

1. **WhatsApp Status**: Arrastar vídeo para Status
2. **Instagram Reels**: Upload via app
3. **TikTok**: Upload via app
4. **YouTube Shorts**: Upload via app

## 🔮 Futuro

- [ ] Integração automática com APIs de redes sociais
- [ ] Sistema de aprovação prévia via web
- [ ] Agendamento automático de posts
- [ ] SadTalker para animação facial
- [ ] Análise de métricas de engajamento

## 🐛 Troubleshooting

### FFmpeg não encontrado
- Verifique se FFmpeg está no PATH
- No Windows: adicionar caminho às variáveis de ambiente

### Piper TTS não funciona
- Use gTTS como alternativa
- Instale: `pip install gtts`

### API DeepSeek falha
- Verifique se API key está correta
- Verifique saldo da conta

### Vídeo sem áudio
- Verifique se arquivo de áudio foi gerado
- Verifique codec de áudio no config.json

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação do Valente Conecta.
