import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function gerarExtratoPDF(movimentacoes: any[], usuarioNome: string, periodo: string) {
  const doc = new jsPDF()
  doc.text(`Extrato de Movimentações - ${usuarioNome}`, 14, 18)
  doc.text(`Período: ${periodo}`, 14, 26)
  autoTable(doc, {
    startY: 32,
    head: [['Data', 'Tipo', 'Valor', 'Descrição']],
    body: movimentacoes.map(m => [
      new Date(m.data).toLocaleDateString(),
      m.tipo,
      `R$ ${m.valor.toFixed(2)}`,
      m.descricao || '',
    ]),
  })
  doc.save(`extrato_${usuarioNome}_${periodo.replace(/\//g, '-')}.pdf`)
}
