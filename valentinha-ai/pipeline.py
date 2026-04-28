#!/usr/bin/env python3
"""
Pipeline principal para geração de vídeos da Valentinha
Orquestra: roteiro -> áudio -> vídeo
"""

import json
import os
import sys
from datetime import datetime

from gerar_roteiro import gerar_roteiro_com_deepseek, gerar_roteiro_mock, salvar_roteiro, parse_roteiro, load_config
from gerar_audio import gerar_audio_piper, gerar_audio_alternativo
from gerar_video import gerar_video_ffmpeg, adicionar_legenda_ffmpeg

def pipeline_completo(tema, config):
    """
    Executa pipeline completo: roteiro -> áudio -> vídeo
    """
    print("="*60)
    print(f"VALENTINHA AI - Pipeline de Geração de Vídeo")
    print(f"Tema: {tema}")
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("="*60)
    
    # ETAPA 1: Gerar Roteiro
    print("\n[1/3] Gerando roteiro com DeepSeek...")
    roteiro_text = gerar_roteiro_com_deepseek(tema, config)
    
    # Se falhar, usa roteiro mockado
    if not roteiro_text:
        print("API DeepSeek falhou, usando roteiro mockado...")
        roteiro_text = gerar_roteiro_mock(tema)
    
    if not roteiro_text:
        print("❌ Falha ao gerar roteiro")
        return None
    
    print("✅ Roteiro gerado com sucesso")
    print(f"Roteiro: {roteiro_text[:100]}...")
    
    # Salvar roteiro
    roteiro_file = salvar_roteiro(tema, roteiro_text, config)
    roteiro_data = parse_roteiro(roteiro_text)
    
    # Salvar JSON parseado
    json_file = roteiro_file.replace('.txt', '.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(roteiro_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Roteiro salvo: {json_file}")
    
    # ETAPA 2: Gerar Áudio
    print("\n[2/3] Gerando áudio...")
    audio_file = gerar_audio_piper(roteiro_data['roteiro'], config)
    
    if not audio_file:
        print("⚠️ Piper TTS falhou, tentando gTTS...")
        audio_file = gerar_audio_alternativo(roteiro_data['roteiro'], config)
    
    if not audio_file:
        print("❌ Falha ao gerar áudio")
        return None
    
    print(f"✅ Áudio gerado: {audio_file}")
    
    # ETAPA 3: Gerar Vídeo
    print("\n[3/3] Renderizando vídeo...")
    video_file = gerar_video_ffmpeg(audio_file, config, roteiro_data)
    
    if not video_file:
        print("❌ Falha ao gerar vídeo")
        return None
    
    print(f"✅ Vídeo gerado: {video_file}")
    
    # Adicionar legenda (opcional)
    if roteiro_data.get('legenda'):
        print("\n[3.5/3] Adicionando legenda...")
        final_video = adicionar_legenda_ffmpeg(video_file, roteiro_data['legenda'], config)
        print(f"✅ Vídeo final com legenda: {final_video}")
    else:
        final_video = video_file
    
    # RESUMO
    print("\n" + "="*60)
    print("PIPELINE CONCLUÍDO COM SUCESSO!")
    print("="*60)
    print(f"Roteiro: {json_file}")
    print(f"Áudio: {audio_file}")
    print(f"Vídeo: {final_video}")
    print(f"Hashtags: {' '.join(roteiro_data.get('hashtags', []))}")
    print("="*60)
    
    return {
        "roteiro": json_file,
        "audio": audio_file,
        "video": final_video,
        "hashtags": roteiro_data.get('hashtags', []),
        "legenda": roteiro_data.get('legenda', '')
    }

def main():
    config = load_config()
    
    # Verificar se API key está configurada
    if not config['deepseek']['api_key']:
        print("❌ ERRO: API key do DeepSeek não configurada")
        print("Edite config.json e adicione sua API key")
        return
    
    # Obter tema
    if len(sys.argv) > 1:
        tema = sys.argv[1]
    else:
        tema = input("Digite o tema do vídeo: ")
    
    # Executar pipeline
    resultado = pipeline_completo(tema, config)
    
    if resultado:
        print("\n🎉 Vídeo pronto para postar!")
        print(f"Arquivo: {resultado['video']}")
    else:
        print("\n❌ Pipeline falhou")

if __name__ == "__main__":
    main()
