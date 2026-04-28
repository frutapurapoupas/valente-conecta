import json
import os
from datetime import datetime

def load_config():
    with open('config.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def gerar_roteiro_com_deepseek(tema, config):
    """
    Gera roteiro usando DeepSeek API
    """
    import requests
    
    prompt = f"""
Você é a Valentinha, assistente virtual do app Valente Conecta.

OBJETIVO:
Criar roteiro curto (15 a 25 segundos) para vídeo vertical (Reels, Status, TikTok).

ESTILO:
- Linguagem simples e rápida
- Tom feminino, amigável e energético
- Foco em economia local e utilidade
- Sempre gerar urgência ou curiosidade

ESTRUTURA:
1. Abertura com bordão
2. Informação principal
3. Benefício claro
4. Chamada para ação

BORDÕES:
"Oi, Valente!"
"Corre que tá valendo!"
"Valentinha te conta tudo!"
"Economiza comigo!"

REGRAS:
- Máximo 3 frases
- Máximo 25 segundos de fala
- Sempre mencionar o app "Valente Conecta"
- Evitar textos longos
- Falar como alguém da cidade

TEMA: {tema}

RETORNE APENAS:
1. Roteiro (texto exato para falar)
2. Legenda (texto para overlay)
3. Hashtags (5-7 hashtags relevantes)
"""
    
    try:
        response = requests.post(
            f"{config['deepseek']['base_url']}/chat/completions",
            headers={
                "Authorization": f"Bearer {config['deepseek']['api_key']}",
                "Content-Type": "application/json"
            },
            json={
                "model": config['deepseek']['model'],
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 500
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            print(f"Erro na API DeepSeek: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Erro ao gerar roteiro: {e}")
        return None

def gerar_roteiro_mock(tema):
    """
    Gera roteiro mockado para teste sem API
    """
    roteiros = {
        "academia IA": """ROTEIRO:
Oi, Valente! Corre que tá valendo! Com a Academia IA do Valente Conecta, você tem treino personalizado que se adapta ao seu ritmo. Economiza tempo e atinge seus objetivos mais rápido!

LEGENDA:
Academia IA - Treino inteligente

HASHTAGS:
#ValenteConecta #AcademiaIA #TreinoInteligente #Fitness #EconomizaTempo""",
        
        "indique e ganhe": """ROTEIRO:
Valentinha te conta tudo! Indique o Valente Conecta para seus amigos e ganhe bônus reais. É dinheiro extra na sua carteira sem esforço!

LEGENDA:
Indique e Ganhe - Bônus para você

HASHTAGS:
#ValenteConecta #IndiqueEGanhe #Bônus #DinheiroExtra #EconomiaLocal""",
        
        "pdv": """ROTEIRO:
Corre que tá valendo! Com o PDV do Valente Conecta, você vende fiado com segurança e ainda controla tudo pelo celular. Organize seu negócio e nunca perca dinheiro!

LEGENDA:
PDV Inteligente - Venda com segurança

HASHTAGS:
#ValenteConecta #PDV #VendaFiado #ComercioLocal #Organizacao""",
        
        "veiculos": """ROTEIRO:
Oi, Valente! No Valente Conecta você aluga ou compra veículos com as melhores condições. Carros, motos e caminhões perto de você. Economiza muito!

LEGENDA:
Veículos - Aluguel e venda

HASHTAGS:
#ValenteConecta #Veiculos #Carros #Motos #Economiza""",
        
        "empregos": """ROTEIRO:
Valentinha te conta tudo! Cadastre seu currículo no Valente Conecta e encontre vagas na sua região. Emprego perto de casa com pagamento via PIX!

LEGENDA:
Empregos - Vagas perto de você

HASHTAGS:
#ValenteConecta #Empregos #Vagas #Currículo #TrabalhoLocal"""
    }
    
    # Retorna roteiro do tema ou um genérico
    return roteiros.get(tema.lower(), roteiros["academia IA"])

def salvar_roteiro(tema, roteiro, config):
    """
    Salva roteiro em arquivo
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"roteiros/{tema}_{timestamp}.txt"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"TEMA: {tema}\n")
        f.write(f"DATA: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
        f.write("="*50 + "\n\n")
        f.write(roteiro)
    
    return filename

def parse_roteiro(roteiro_text):
    """
    Extrai roteiro, legenda e hashtags do texto gerado
    """
    lines = roteiro_text.split('\n')
    
    roteiro = []
    legenda = ""
    hashtags = []
    
    current_section = "roteiro"
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if "LEGENDA:" in line.upper():
            current_section = "legenda"
            continue
        elif "HASHTAG" in line.upper():
            current_section = "hashtags"
            continue
        
        if current_section == "roteiro":
            roteiro.append(line)
        elif current_section == "legenda":
            legenda = line
        elif current_section == "hashtags":
            hashtags = line.split()
    
    return {
        "roteiro": " ".join(roteiro),
        "legenda": legenda,
        "hashtags": hashtags
    }

if __name__ == "__main__":
    import sys
    
    config = load_config()
    tema = sys.argv[1] if len(sys.argv) > 1 else "academia IA"
    
    print(f"Gerando roteiro para: {tema}")
    
    # Tenta usar API DeepSeek primeiro
    roteiro_text = gerar_roteiro_com_deepseek(tema, config)
    
    # Se falhar, usa roteiro mockado
    if not roteiro_text:
        print("API DeepSeek falhou, usando roteiro mockado...")
        roteiro_text = gerar_roteiro_mock(tema)
    
    if roteiro_text:
        print("Roteiro gerado:")
        print(roteiro_text)
        
        # Salvar roteiro
        filename = salvar_roteiro(tema, roteiro_text, config)
        print(f"\nRoteiro salvo em: {filename}")
        
        # Parse e salvar JSON
        parsed = parse_roteiro(roteiro_text)
        json_filename = filename.replace('.txt', '.json')
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(parsed, f, ensure_ascii=False, indent=2)
        print(f"Roteiro parseado salvo em: {json_filename}")
    else:
        print("Falha ao gerar roteiro")
