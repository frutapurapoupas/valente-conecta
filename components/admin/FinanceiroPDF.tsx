// components/admin/FinanceiroPDF.tsx
'use client';

import { FileText } from 'lucide-react';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  data: string;
  categoria?: string;
  forma_pagamento?: string;
  status?: string;
  observacoes?: string;
}

interface FinanceiroPDFProps {
  transacoes: Transacao[];
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  children?: React.ReactNode;
}

export default function FinanceiroPDF({ 
  transacoes, 
  totalReceitas, 
  totalDespesas, 
  saldo,
  children 
}: FinanceiroPDFProps) {
  
  const gerarPDF = async () => {
    // Importar dinamicamente apenas quando clicar
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Título
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text('📊 Relatório Financeiro', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });

    // Resumo
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('RESUMO FINANCEIRO', 14, 45);

    const summaryData = [
      ['Total Receitas', `R$ ${totalReceitas.toFixed(2)}`],
      ['Total Despesas', `R$ ${totalDespesas.toFixed(2)}`],
      ['Saldo', `R$ ${saldo.toFixed(2)}`],
      ['Margem', `${totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : 0}%`]
    ];

    autoTable(doc, {
      startY: 50,
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right' }
      }
    });

    // Tabela de transações
    const tableData = transacoes.map(t => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.descricao,
      t.categoria || '-',
      t.tipo === 'receita' ? '+' : '-',
      `R$ ${t.valor.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY + 10 || 70,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    // Rodapé
    const finalY = (doc as any).lastAutoTable?.finalY || 250;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Valente Conecta - Sistema Financeiro', pageWidth / 2, finalY + 15, { align: 'center' });

    // Salvar PDF
    doc.save(`financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button
      onClick={gerarPDF}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm transition"
    >
      <FileText size={16} /> PDF
    </button>
  );
}