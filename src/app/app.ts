import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './servicios/api.service';
import { Ticket, Equipo, Tecnico, Cliente } from './modelos/modelos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  vistaActual: string = 'tickets';

  tickets: Ticket[] = [];
  equipos: Equipo[] = [];
  tecnicos: Tecnico[] = [];
  clientes: Cliente[] = [];

  filtroCodigotek: string = '';

  // --- VARIABLES FORMULARIO TICKET ---
  modoEdicion: boolean = false;
  idTicketEditando: number | null = null;
  idEquipoSeleccionado: number = 1;
  idTecnicoSeleccionado: number = 1;
  problemaReportado: string = '';
  estadoSeleccionado: string = 'Ingresado';
  diagnosticoFinal: string = '';
  solucionAplicada: string = '';
  precio: number | null = null;

  // --- VARIABLES CLIENTE (CREAR / EDITAR) ---
  editandoCliente: boolean = false;
  idClienteEditando: number | null = null;
  nuevoCliente: Cliente = { nombreCompleto: '', telefono: '', email: '' };

  // --- VARIABLES EQUIPO (CREAR / EDITAR) ---
  editandoEquipo: boolean = false;
  idEquipoEditando: number | null = null;
  idClienteParaEquipo: number = 1;
  nuevoEquipo = {
    codigotek: '',
    tipo: 'Laptop',
    marcaModelo: '',
    numeroSerie: '',
    detallesTecnicos: ''
  };

  // --- VARIABLES TÉCNICO (CREAR / EDITAR) ---
  editandoTecnico: boolean = false;
  idTecnicoEditando: number | null = null;
  nuevoTecnico: Tecnico = { nombre: '', email: '' };

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  // --- CÁLCULO INTELIGENTE DE MÉTRICAS (KPIs) ---
  get ticketsEnTaller(): number {
    return this.tickets.filter(t => t.estado !== 'Entregado' && t.estado !== 'Rechazado / Devuelto').length;
  }

  get ticketsEsperandoAprobacion(): number {
    return this.tickets.filter(t => t.estado === 'Esperando Aprobación').length;
  }

  get ingresosTotales(): number {
    return this.tickets
      .filter(t => t.estado === 'Entregado' || t.estado === 'Reparado')
      .reduce((acc, t) => acc + (Number(t.precio) || 0), 0);
  }

  cargarDatosIniciales(): void {
    this.listarTickets();
    this.cargarEquipos();
    this.cargarClientes();
    this.cargarTecnicos();
  }

  listarTickets(): void {
    this.apiService.listarTickets().subscribe(data => {
      this.tickets = data;
      this.cdr.detectChanges();
    });
  }

  cargarEquipos(): void {
    this.apiService.listarEquipos().subscribe(data => {
      this.equipos = data;
      if (this.equipos.length > 0 && !this.modoEdicion) {
        this.idEquipoSeleccionado = this.equipos[0].idEquipo!;
      }
      this.cdr.detectChanges();
    });
  }

  cargarClientes(): void {
    this.apiService.listarClientes().subscribe(data => {
      this.clientes = data;
      if (this.clientes.length > 0 && !this.editandoEquipo) {
        this.idClienteParaEquipo = this.clientes[0].idCliente!;
      }
      this.cdr.detectChanges();
    });
  }

  cargarTecnicos(): void {
    this.apiService.listarTecnicos().subscribe(data => {
      this.tecnicos = data;
      this.cdr.detectChanges();
    });
  }

  buscarPorCodigo(): void {
    const termino = this.filtroCodigotek.trim().toLowerCase();
    this.apiService.listarTickets().subscribe(data => {
      if (termino === '') {
        this.tickets = data;
      } else {
        this.tickets = data.filter(t => 
          t.equipo.codigotek.toLowerCase().includes(termino) ||
          t.equipo.marcaModelo.toLowerCase().includes(termino) ||
          (t.equipo.numeroSerie && t.equipo.numeroSerie.toLowerCase().includes(termino)) ||
          t.equipo.cliente.nombreCompleto.toLowerCase().includes(termino)
        );
      }
      this.cdr.detectChanges();
    });
  }

  // --- CRUD TICKETS ---
  guardarTicket(): void {
    const payload = {
      equipo: { idEquipo: Number(this.idEquipoSeleccionado) },
      tecnico: { idTecnico: Number(this.idTecnicoSeleccionado) },
      problemaReportado: this.problemaReportado,
      estado: this.estadoSeleccionado,
      diagnosticoFinal: this.diagnosticoFinal,
      solucionAplicada: this.solucionAplicada,
      precio: this.precio
    };

    if (this.modoEdicion && this.idTicketEditando) {
      this.apiService.actualizarTicket(this.idTicketEditando, payload).subscribe(() => {
        this.listarTickets();
        this.limpiarFormulario();
      });
    } else {
      this.apiService.crearTicket(payload).subscribe(() => {
        this.listarTickets();
        this.limpiarFormulario();
      });
    }
  }

  // Botón rápido para aprobar o rechazar cotización directo desde la tabla
  cambiarEstadoRapido(ticket: Ticket, nuevoEstado: string): void {
    const payload = {
      equipo: { idEquipo: ticket.equipo.idEquipo },
      tecnico: { idTecnico: ticket.tecnico?.idTecnico || 1 },
      problemaReportado: ticket.problemaReportado,
      estado: nuevoEstado,
      diagnosticoFinal: ticket.diagnosticoFinal,
      solucionAplicada: ticket.solucionAplicada,
      precio: ticket.precio
    };
    this.apiService.actualizarTicket(ticket.idTicket!, payload).subscribe(() => {
      this.listarTickets();
    });
  }

  cargarParaEditar(ticket: Ticket): void {
    this.modoEdicion = true;
    this.idTicketEditando = ticket.idTicket!;
    this.idEquipoSeleccionado = ticket.equipo.idEquipo!;
    this.idTecnicoSeleccionado = ticket.tecnico?.idTecnico || 1;
    this.problemaReportado = ticket.problemaReportado;
    this.estadoSeleccionado = ticket.estado || 'Ingresado';
    this.diagnosticoFinal = ticket.diagnosticoFinal || '';
    this.solucionAplicada = ticket.solucionAplicada || ''; // <-- Aquí
    this.precio = ticket.precio || null;
  }

  eliminarTicket(id: number): void {
    if (confirm('¿Estás seguro de eliminar este ticket?')) {
      this.apiService.eliminarTicket(id).subscribe(() => {
        this.listarTickets();
      });
    }
  }

  limpiarFormulario(): void {
    this.modoEdicion = false;
    this.idTicketEditando = null;
    this.problemaReportado = '';
    this.estadoSeleccionado = 'Ingresado';
    this.diagnosticoFinal = '';
    this.solucionAplicada = ''; // <-- Y aquí
    this.precio = null;
    this.cdr.detectChanges();
  }

  // --- CRUD CLIENTES ---
  guardarCliente(): void {
    if (this.editandoCliente && this.idClienteEditando) {
      this.apiService.actualizarCliente(this.idClienteEditando, this.nuevoCliente).subscribe(() => {
        this.cancelarEdicionCliente();
        this.cargarClientes();
        this.cargarEquipos();
        this.listarTickets();
      });
    } else {
      this.apiService.crearCliente(this.nuevoCliente).subscribe(clienteCreado => {
        this.nuevoCliente = { nombreCompleto: '', telefono: '', email: '' };
        this.cargarClientes();
        this.idClienteParaEquipo = clienteCreado.idCliente!;
      });
    }
  }

  seleccionarClienteParaEditar(c: Cliente): void {
    this.editandoCliente = true;
    this.idClienteEditando = c.idCliente!;
    this.nuevoCliente = { nombreCompleto: c.nombreCompleto, telefono: c.telefono, email: c.email };
  }

  cancelarEdicionCliente(): void {
    this.editandoCliente = false;
    this.idClienteEditando = null;
    this.nuevoCliente = { nombreCompleto: '', telefono: '', email: '' };
  }

  // --- CRUD EQUIPOS ---
  guardarEquipo(): void {
    const payload = {
      cliente: { idCliente: Number(this.idClienteParaEquipo) },
      codigotek: this.nuevoEquipo.codigotek,
      tipo: this.nuevoEquipo.tipo,
      marcaModelo: this.nuevoEquipo.marcaModelo,
      numeroSerie: this.nuevoEquipo.numeroSerie,
      detallesTecnicos: this.nuevoEquipo.detallesTecnicos
    };

    if (this.editandoEquipo && this.idEquipoEditando) {
      this.apiService.actualizarEquipo(this.idEquipoEditando, payload).subscribe({
        next: () => {
          this.cancelarEdicionEquipo();
          this.cargarEquipos();
          this.listarTickets();
        },
        error: () => alert('Error al actualizar: Verifica que el Código Tek no esté repetido.')
      });
    } else {
      this.apiService.crearEquipo(payload).subscribe({
        next: () => {
          this.cancelarEdicionEquipo();
          this.cargarEquipos();
        },
        error: () => alert('Error: Verifica que el Código Tek no esté repetido.')
      });
    }
  }

  seleccionarEquipoParaEditar(eq: Equipo): void {
    this.editandoEquipo = true;
    this.idEquipoEditando = eq.idEquipo!;
    this.idClienteParaEquipo = eq.cliente.idCliente!;
    this.nuevoEquipo = {
      codigotek: eq.codigotek,
      tipo: eq.tipo,
      marcaModelo: eq.marcaModelo,
      numeroSerie: eq.numeroSerie || '',
      detallesTecnicos: eq.detallesTecnicos || ''
    };
  }

  cancelarEdicionEquipo(): void {
    this.editandoEquipo = false;
    this.idEquipoEditando = null;
    this.nuevoEquipo = { codigotek: '', tipo: 'Laptop', marcaModelo: '', numeroSerie: '', detallesTecnicos: '' };
  }

  // --- CRUD TÉCNICOS ---
  guardarTecnico(): void {
    if (this.editandoTecnico && this.idTecnicoEditando) {
      this.apiService.actualizarTecnico(this.idTecnicoEditando, this.nuevoTecnico).subscribe(() => {
        this.cancelarEdicionTecnico();
        this.cargarTecnicos();
        this.listarTickets();
      });
    } else {
      this.apiService.crearTecnico(this.nuevoTecnico).subscribe(() => {
        this.cancelarEdicionTecnico();
        this.cargarTecnicos();
      });
    }
  }

  seleccionarTecnicoParaEditar(t: Tecnico): void {
    this.editandoTecnico = true;
    this.idTecnicoEditando = t.idTecnico!;
    this.nuevoTecnico = { nombre: t.nombre, email: t.email };
  }

  cancelarEdicionTecnico(): void {
    this.editandoTecnico = false;
    this.idTecnicoEditando = null;
    this.nuevoTecnico = { nombre: '', email: '' };
  }
}