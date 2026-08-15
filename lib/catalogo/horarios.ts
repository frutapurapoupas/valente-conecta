// Caminho: C:\valente_conecta\lib\catalogo\horarios.ts
//
// Calculo de "aberto agora" a partir do horario semanal do fornecedor
// (ver migration 042_horario_funcionamento_fornecedor.sql). Roda no
// cliente, com a hora local do navegador — suficiente porque o fornecedor
// e o comprador estao sempre na mesma cidade/fuso.

import type { HorarioDia } from './marketplaceTypes';

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function diaVazio(dia: number): HorarioDia {
  return { dia, ativo: false, abre: '08:00', fecha: '18:00' };
}

export function horariosPadrao(): HorarioDia[] {
  return [0, 1, 2, 3, 4, 5, 6].map(diaVazio);
}

export function estaAbertoAgora(horarios: HorarioDia[] | null | undefined, agora: Date = new Date()): boolean {
  if (!horarios || horarios.length === 0) return false;
  const diaAtual = horarios.find((h) => h.dia === agora.getDay());
  if (!diaAtual || !diaAtual.ativo || !diaAtual.abre || !diaAtual.fecha) return false;

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const [abreH, abreM] = diaAtual.abre.split(':').map(Number);
  const [fechaH, fechaM] = diaAtual.fecha.split(':').map(Number);
  const minutosAbre = abreH * 60 + abreM;
  const minutosFecha = fechaH * 60 + fechaM;

  // Horario que vira a meia-noite (ex: 18:00 as 02:00) — fechamento no dia seguinte.
  if (minutosFecha <= minutosAbre) {
    return minutosAgora >= minutosAbre || minutosAgora < minutosFecha;
  }
  return minutosAgora >= minutosAbre && minutosAgora < minutosFecha;
}
