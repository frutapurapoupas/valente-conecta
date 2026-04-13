import qrcode
import sys

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python gerar_qr.py <url>")
        sys.exit(1)
    url = sys.argv[1]
    img = qrcode.make(url)
    img.save("qr_profissional.png")
    print("QR Code gerado: qr_profissional.png")
