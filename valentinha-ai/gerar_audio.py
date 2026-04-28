import json
import os
import subprocess
from datetime import datetime

def load_config():
    with open('config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def gerar_audio_piper(texto, config):
    """
    Gera áudio usando Piper TTS
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"audio/audio_{timestamp}.wav"
    
    # Verificar se o modelo Piper está configurado
    if not config['piper']['model_path']:
        print("ERRO: Caminho do modelo Piper não configurado em config.json")
        print("Instale Piper TTS: https://github.com/rhasspy/piper")
        return None
    
    try:
        # Comando Piper TTS
        cmd = [
            config['piper']['model_path'],
            "--model", config['piper']['voice'],
            "--text", texto,
            "--output_file", output_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Áudio gerado: {output_file}")
            return output_file
        else:
            print(f"Erro ao gerar áudio: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"Erro ao executar Piper TTS: {e}")
        return None

def gerar_audio_alternativo(texto, config):
    """
    Alternativa: usar gTTS (Google TTS) se Piper não estiver disponível
    """
    try:
        from gtts import gTTS
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"audio/audio_{timestamp}.mp3"
        
        tts = gTTS(text=texto, lang='pt', slow=False)
        tts.save(output_file)
        
        print(f"Áudio gerado (gTTS): {output_file}")
        return output_file
        
    except ImportError:
        print("gTTS não instalado. Instale com: pip install gtts")
        return None
    except Exception as e:
        print(f"Erro ao gerar áudio com gTTS: {e}")
        return None

if __name__ == "__main__":
    from datetime import datetime
    import sys
    
    config = load_config()
    
    # Ler roteiro do arquivo JSON
    if len(sys.argv) > 1:
        roteiro_file = sys.argv[1]
        with open(roteiro_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            texto = data['roteiro']
    else:
        texto = "Oi, Valente! Corre que tá valendo! Economiza comigo no Valente Conecta!"
    
    print(f"Gerando áudio para: {texto}")
    
    # Tentar Piper TTS primeiro
    audio_file = gerar_audio_piper(texto, config)
    
    # Se falhar, tentar gTTS
    if not audio_file:
        print("Tentando alternativa gTTS...")
        audio_file = gerar_audio_alternativo(texto, config)
    
    if audio_file:
        print(f"Áudio salvo em: {audio_file}")
    else:
        print("Falha ao gerar áudio")
