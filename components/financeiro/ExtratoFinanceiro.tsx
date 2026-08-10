// components/financeiro/ExtratoFinanceiro.tsx
// ?? DESIGN + LÓGICA - Extrato (PDF e Impressão)

"use client";

import { FileText, Printer } from 'lucide-react';
import { Transacao } from '@/services/financeiroService';
import { calcularResumo, filtrarTransacoes, formatarDataCompleta } from '@/utils/financeiroUtils';

interface ExtratoFinanceiroProps {
  transacoes: Transacao[];
  filtroPeriodo: string;
  filtroTipo: string;
}

export default function ExtratoFinanceiro({
  transacoes,
  filtroPeriodo,
  filtroTipo,
}: ExtratoFinanceiroProps) {
  const transacoesFiltradas = filtrarTransacoes(transacoes, filtroPeriodo, filtroTipo);
  const resumo = calcularResumo(transacoesFiltradas);

  // Gerar PDF
  const gerarExtrato = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('📊 EXTRATO FINANCEIRO', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`Período: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Gerado em: ${formatarDataCompleta(new Date().toISOString())}`, pageWidth / 2, 35, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO DO PERÍODO', 14, 50);

      autoTable(doc, {
        startY: 55,
        body: [
          ['Total Receitas', `R$ ${resumo.totalReceitas.toFixed(2)}`],
          ['Total Despesas', `R$ ${resumo.totalDespesas.toFixed(2)}`],
          ['Saldo', `R$ ${resumo.saldo.toFixed(2)}`, resumo.saldo >= 0 ? '? POSITIVO' : '? NEGATIVO'],
        ],
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 40, halign: 'right' },
          2: { cellWidth: 40, halign: 'center' }
        }
      });

      const tableData = transacoesFiltradas.map(t => [
        new Date(t.data).toLocaleDateString('pt-BR'),
        t.descricao,
        t.categoria || '-',
        t.recorrencia && t.recorrencia !== 'nenhuma' ? `🔄 ${t.recorrencia}` : '-',
        t.tipo === 'receita' ? '+' : '-',
        `R$ ${t.valor.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY + 10 || 70,
        head: [['Data', 'Descrição', 'Categoria', 'Recorrência', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 45 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 15 },
          5: { cellWidth: 30, halign: 'right' }
        }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 200;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Valente Conecta - Sistema Financeiro', pageWidth / 2, finalY + 15, { align: 'center' });
      doc.text(`Total de registros: ${transacoesFiltradas.length}`, pageWidth / 2, finalY + 22, { align: 'center' });

      doc.save(`extrato_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar extrato:', error);
      alert('? Erro ao gerar extrato. Verifique se as bibliotecas estão instaladas.');
    }
  };

  // Imprimir extrato
  const imprimirExtrato = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Extrato Financeiro</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; background: #fff; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { font-size: 24px; }
          .header p { font-size: 12px; opacity: 0.8; margin-top: 4px; }
          .resumo { display: flex; justify-content: space-around; padding: 15px; background: #f3f4f6; margin: 10px 0; border-radius: 8px; flex-wrap: wrap; }
          .resumo-item { text-align: center; padding: 5px 15px; }
          .resumo-item .label { font-size: 11px; color: #6b7280; }
          .resumo-item .valor { font-size: 18px; font-weight: bold; }
          .resumo-item .valor.positivo { color: #22c55e; }
          .resumo-item .valor.negativo { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
          th { background: #22c55e; color: white; padding: 8px; text-align: left; }
          td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
          .receita { color: #22c55e; }
          .despesa { color: #ef4444; }
          .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 EXTRATO FINANCEIRO</h1>
          <p>Período: ${new Date().toLocaleDateString('pt-BR')}</p>
          <p>Gerado em: ${formatarDataCompleta(new Date().toISOString())}</p>
        </div>
        <div class="resumo">
          <div class="resumo-item">
            <div class="label">Total Receitas</div>
            <div class="valor positivo">R$ ${resumo.totalReceitas.toFixed(2)}</div>
          </div>
          <div class="resumo-item">
            <div class="label">Total Despesas</div>
            <div class="valor negativo">R$ ${resumo.totalDespesas.toFixed(2)}</div>
          </div>
          <div class="resumo-item">
            <div class="label">Saldo</div>
            <div class="valor ${resumo.saldo >= 0 ? 'positivo' : 'negativo'}">R$ ${resumo.saldo.toFixed(2)}</div>
          </div>
          <div class="resumo-item">
            <div class="label">Registros</div>
            <div class="valor" style="font-size:18px;font-weight:bold;">${transacoesFiltradas.length}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Descrição</th><th>Categoria</th><th>Recorrência</th><th>Tipo</th><th style="text-align:right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${transacoesFiltradas.map(t => `
              <tr>
                <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
                <td>${t.descricao}</td>
                <td>${t.categoria || '-'}</td>
                <td>${t.recorrencia && t.recorrencia !== 'nenhuma' ? `🔄 ${t.recorrencia}` : '-'}</td>
                <td class="${t.tipo}">${t.tipo === 'receita' ? '+' : '-'}</td>
                <td style="text-align:right;font-weight:bold;">R$ ${t.valor.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Valente Conecta - Sistema Financeiro | Total de registros: ${transacoesFiltradas.length}</div>
        <div class="no-print" style="text-align:center;margin-top:20px;">
          <button onclick="window.print()" style="padding:10px 30px;background:#22c55e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">🖨️ Imprimir</button>
          <button onclick="window.close()" style="padding:10px 30px;background:#6b7280;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;margin-left:10px;">Fechar</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={gerarExtrato}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 text-sm transition"
      >
        <FileText size={16} /> Extrato PDF
      </button>
      <button
        onClick={imprimirExtrato}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 text-sm transition"
      >
        <Printer size={16} /> Imprimir Extrato
      </button>
    </div>
  );
}

