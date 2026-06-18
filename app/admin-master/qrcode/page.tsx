"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Copy, CheckCircle, Share2, Download, 
  Crown, Shield, Key, Smartphone, 
  Link as LinkIcon, ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function AdminMasterQRCode() {
  const [adminLink, setAdminLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timestamp = Date.now();
    const uniqueCode = `ADMIN_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    setAdminLink(`${window.location.origin}/admin-master/login?ref=${uniqueCode}`);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(adminLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'admin-master-qrcode.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const shareWhatsApp = () => {
    const message = `👑 *ACESSO ADMIN MASTER - Valente Conecta*\n\n` +
      `Link exclusivo para acesso administrativo:\n` +
      `${adminLink}\n\n` +
      `Senha padrão: admin123\n\n` +
      `⚠️ *Mantenha este link em segurança!*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6 rounded-b-3xl">
        <Link href="/admin-master/dashboard" className="inline-flex items-center gap-1 text-white/80 text-sm mb-4 hover:text-white transition">
          <ArrowLeft size={16} /> Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Crown size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">QR Code Admin Master</h1>
            <p className="text-sm opacity-90">Link exclusivo para acesso administrativo</p>
          </div>
        </div>
      </div>

      {/* Alertas de segurança */}
      <div className="mx-5 mt-5">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-3">
          <Shield size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">⚠️ Link exclusivo e confidencial</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Este QR Code e link dão acesso total ao painel administrativo. 
              Mantenha em local seguro e compartilhe apenas com pessoas autorizadas.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="mx-5 mt-6 bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl inline-block mx-auto">
            {adminLink && (
              <QRCodeSVG 
                value={adminLink} 
                size={220}
                bgColor="#ffffff"
                fgColor="#4f46e5"
                level="H"
                includeMargin={true}
              />
            )}
          </div>
          
          <div className="mt-4">
            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              <Key size={10} /> Link único e intransferível
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
            >
              {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "Copiado!" : "Copiar Link"}
            </button>
            <button 
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              <Share2 size={16} /> WhatsApp
            </button>
            <button 
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <Download size={16} /> Download QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Informações do Link */}
      <div className="mx-5 mt-5 bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
          <LinkIcon size={14} className="text-indigo-600" /> Link de Acesso
        </h3>
        <div className="bg-gray-50 p-2 rounded-lg">
          <code className="text-[10px] text-gray-600 break-all">{adminLink}</code>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Senha padrão:</strong> admin123
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <strong>Validade:</strong> Ilimitado (link permanente)
          </p>
        </div>
      </div>

      {/* Instruções */}
      <div className="mx-5 mt-5 mb-8">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">📌 Como usar</h3>
        <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm text-blue-800">
          <p>1. <strong>Compartilhe o QR Code</strong> com administradores autorizados</p>
          <p>2. Ao escanear, acessa a página de login do Admin Master</p>
          <p>3. Digite a senha <strong>admin123</strong> para acessar o dashboard</p>
          <p>4. Mantenha o QR Code em local seguro</p>
        </div>
      </div>
    </div>
  );
}