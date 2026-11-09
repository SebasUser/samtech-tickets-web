export interface EstadoTicket {
  valor: string;      // lo que guarda la API
  etiqueta: string;   // lo que se ve en los selectores
  clase: string;      // clase CSS del badge
}

export const ESTADOS: EstadoTicket[] = [
  { valor: 'Ingresado',                etiqueta: '1. Ingresado',   clase: 'status-ingresado' },
  { valor: 'En Diagnóstico',           etiqueta: '2. Diagnóstico', clase: 'status-diagnostico' },
  { valor: 'Esperando Aprobación',     etiqueta: '3. Cotizado',    clase: 'status-esperando' },
  { valor: 'Aprobado / En Reparación', etiqueta: '4. En taller',   clase: 'status-aprobado' },
  { valor: 'Reparado',                 etiqueta: '5. Reparado',    clase: 'status-reparado' },
  { valor: 'Entregado',                etiqueta: '6. Entregado',   clase: 'status-entregado' },
  { valor: 'Rechazado / Devuelto',     etiqueta: 'Devuelto',       clase: 'status-rechazado' }
];

export function claseEstado(valor?: string): string {
  return ESTADOS.find(e => e.valor === valor)?.clase ?? 'status-ingresado';
}
