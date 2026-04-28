import json
import os
import subprocess
from datetime import datetime

def load_config():
    with open('config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def gerar_video_ffmpeg(audio_file, config, roteiro_data=None):
    """
    Gera vídeo usando FFmpeg com avatar estático
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"video/video_{timestamp}.mp4"
    
    avatar_path = config['valentinha']['avatar_path']
    
    # Verificar se avatar existe
    if not os.path.exists(avatar_path):
        print(f"ERRO: Avatar não encontrado em {avatar_path}")
        print("Coloque uma imagem da Valentinha na pasta input/")
        return None
    
    try:
        # Obter duração do áudio
        duration_cmd = [
            config['ffmpeg']['path'],
            "-i", audio_file,
            "-f", "null",
            "-"
        ]
        result = subprocess.run(duration_cmd, capture_output=True, text=True)
        
        # Extrair duração (simplificado - em produção usar ffprobe)
        duration = 20  # padrão 20 segundos
        
        # Comando FFmpeg para criar vídeo com avatar estático
        # -loop 1: loop da imagem
        # -i: imagem de entrada
        # -i: áudio de entrada
        # -vf: filtro de vídeo (escala simples)
        # -t: duração
        # -pix_fmt: formato de pixel
        resolution = config['ffmpeg']['resolution']
        width, height = resolution.split('x')
        cmd = [
            config['ffmpeg']['path'],
            "-loop", "1",
            "-i", avatar_path,
            "-i", audio_file,
            "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2",
            "-c:v", config['ffmpeg']['video_codec'],
            "-t", str(duration),
            "-pix_fmt", "yuv420p",
            "-c:a", config['ffmpeg']['audio_codec'],
            "-shortest",
            output_file
        ]
        
        print("Renderizando vídeo com FFmpeg...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Vídeo gerado: {output_file}")
            return output_file
        else:
            print(f"Erro ao gerar vídeo: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"Erro ao executar FFmpeg: {e}")
        return None

def adicionar_legenda_ffmpeg(video_file, legenda, config):
    """
    Adiciona legenda ao vídeo usando FFmpeg
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"final/video_com_legenda_{timestamp}.mp4"
    
    try:
        # Comando FFmpeg com drawtext para legenda
        cmd = [
            config['ffmpeg']['path'],
            "-i", video_file,
            "-vf", f"drawtext=text='{legenda}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-100:box=1:boxcolor=black@0.5:boxborderw=5",
            "-c:a", "copy",
            output_file
        ]
        
        print("Adicionando legenda...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Vídeo com legenda: {output_file}")
            return output_file
        else:
            print(f"Erro ao adicionar legenda: {result.stderr}")
            return video_file  # retorna original sem legenda
            
    except Exception as e:
        print(f"Erro ao adicionar legenda: {e}")
        return video_file

if __name__ == "__main__":
    import sys
    
    config = load_config()
    
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
    else:
        audio_file = "audio/audio.wav"
    
    if len(sys.argv) > 2:
        roteiro_file = sys.argv[2]
        with open(roteiro_file, 'r', encoding='utf-8') as f:
            roteiro_data = json.load(f)
    else:
        roteiro_data = None
    
    print(f"Gerando vídeo com áudio: {audio_file}")
    video_file = gerar_video_ffmpeg(audio_file, config, roteiro_data)
    
    if video_file and roteiro_data and roteiro_data.get('legenda'):
        final_video = adicionar_legenda_ffmpeg(video_file, roteiro_data['legenda'], config)
        print(f"Vídeo final: {final_video}")
    elif video_file:
        print(f"Vídeo final: {video_file}")
    else:
        print("Falha ao gerar vídeo")
