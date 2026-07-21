// components/cozinha/ExtratoCompras.tsx
// ðŸŽ¨ UI - Extrato de Compras

"use client";

import { Printer, Download } from 'lucide-react';

interface ExtratoComprasProps {
  itens: any[];
  onImprimir?: () => void;
}

export function ExtratoCompras({ itens, onImprimir }: ExtratoComprasProps) {
  const gerarExtrato = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // CabeÃ§alho
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94);
      doc.text('ðŸ“‹ LISTA DE COMPRAS', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Total de itens: ${itens.length}`, pageWidth / 2, 37, { align: 'center' });

      // Tabela
      const tableData = itens.map(item => [
        item.nome,
        item.quantidade.toFixed(2),
        item.unidade,
        item.prioridade || 'media',
        item.comprado ? 'âœ…' : 'â¬œ'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Item', 'Quantidade', 'Unidade', 'Prioridade', 'Status']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] }
      });

      // RodapÃ©
      const finalY = (doc as any).lastAutoTable?.finalY || 200;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Valente Conecta - Lista de Compras', pageWidth / 2, finalY + 15, { align: 'center' });

      doc.save(`lista_compras_${new Date().toISOString().split('T')[0]}.pdf`);
      
      if (onImprimir) onImprimir();
    } catch (error) {
      console.error('Erro ao gerar extrato:', error);
      alert('âŒ Erro ao gerar extrato. Verifique se as bibliotecas estÃ£o instaladas.');
    }
  };

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={gerarExtrato}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm transition"
      >
        <Download size={16} /> Baixar Extrato
      </button>
      <button
        onClick={imprimir}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
      >
        <Printer size={16} /> Imprimir
      </button>
    </div>
  );
}


