export interface Cliente {
  idCliente?: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
}

export interface Equipo {
  idEquipo?: number;
  cliente: Cliente;
  codigotek: string;
  tipo: string;
  marcaModelo: string;
  numeroSerie: string;
  detallesTecnicos: string;
}

export interface Tecnico {
  idTecnico?: number;
  nombre: string;
  email: string;
}

export interface Ticket {
  idTicket?: number;
  equipo: Equipo;
  tecnico?: Tecnico;
  fechaIngreso?: string;
  problemaReportado: string;
  estado?: string;
  diagnosticoFinal?: string;
  solucionAplicada?: string;
  precio?: number;
}
