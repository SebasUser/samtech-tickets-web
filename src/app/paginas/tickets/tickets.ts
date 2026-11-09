import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../servicios/api.service';
import { DatosService } from '../../servicios/datos.service';
import { Ticket } from '../../modelos/modelos';
import { ESTADOS } from '../../compartido/estados';
import { EstadoBadge } from '../../compartido/estado-badge';
import { Modal } from '../../compartido/modal';
import { SolesPipe } from '../../compartido/soles.pipe';

interface FormTicket {
  idEquipo: number | null;
  idTecnico: number | null;
  problemaReportado: string;
  estado: string;
  diagnosticoFinal: string;
  solucionAplicada: string;
  precio: number | null;
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet, Modal, EstadoBadge, SolesPipe],
  templateUrl: './tickets.html'
})
export class TicketsPage {
  private readonly api = inject(ApiService);
  protected readonly datos = inject(DatosService);
  protected readonly estados = ESTADOS;

  // --- Búsqueda y filtro (se aplican en el navegador, sin volver a llamar a la API) ---
  protected readonly busqueda = signal('');
  protected readonly filtroEstado = signal('');

  protected readonly ticketsFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();
    return this.datos.tickets().filter(t => {
      if (estado && t.estado !== estado) return false;
      if (!q) return true;
      return [t.equipo.codigotek, t.equipo.marcaModelo, t.equipo.numeroSerie, t.equipo.cliente.nombreCompleto]
        .some(valor => (valor ?? '').toLowerCase().includes(q));
    });
  });

  // --- Panel de detalle ---
  protected readonly idDetalle = signal<number | null>(null);
  protected readonly ticketDetalle = computed(() => {
    const id = this.idDetalle();
    return id === null ? null : this.datos.tickets().find(t => t.idTicket === id) ?? null;
  });

  // --- Formulario (crear / editar) ---
  protected readonly formularioAbierto = signal(false);
  protected readonly idEditando = signal<number | null>(null);
  protected readonly modoEdicion = computed(() => this.idEditando() !== null);
  protected readonly guardando = signal(false);
  protected form: FormTicket = this.formularioVacio();

  private formularioVacio(): FormTicket {
    return {
      idEquipo: null,
      idTecnico: null,
      problemaReportado: '',
      estado: 'Ingresado',
      diagnosticoFinal: '',
      solucionAplicada: '',
      precio: null
    };
  }

  // --- Última etapa registrada de la bitácora (para mostrar solo un resumen en la lista) ---
  protected etapaActual(t: Ticket): 'solucion' | 'diagnostico' | 'falla' {
    if (t.solucionAplicada?.trim()) return 'solucion';
    if (t.diagnosticoFinal?.trim()) return 'diagnostico';
    return 'falla';
  }

  protected etiquetaAvance(t: Ticket): string {
    switch (this.etapaActual(t)) {
      case 'solucion': return 'Solución aplicada';
      case 'diagnostico': return 'Diagnóstico y cotización';
      default: return 'Falla reportada';
    }
  }

  protected textoAvance(t: Ticket): string {
    switch (this.etapaActual(t)) {
      case 'solucion': return t.solucionAplicada ?? '';
      case 'diagnostico': return t.diagnosticoFinal ?? '';
      default: return t.problemaReportado;
    }
  }

  protected verDetalle(t: Ticket): void {
    this.idDetalle.set(t.idTicket ?? null);
  }

  protected cerrarDetalle(): void {
    this.idDetalle.set(null);
  }

  protected nuevo(): void {
    this.idEditando.set(null);
    this.form = this.formularioVacio();
    this.form.idEquipo = this.datos.equipos()[0]?.idEquipo ?? null;
    this.form.idTecnico = this.datos.tecnicos()[0]?.idTecnico ?? null;
    this.formularioAbierto.set(true);
  }

  protected editar(t: Ticket): void {
    this.idDetalle.set(null);
    this.idEditando.set(t.idTicket ?? null);
    this.form = {
      idEquipo: t.equipo.idEquipo ?? null,
      idTecnico: t.tecnico?.idTecnico ?? null,
      problemaReportado: t.problemaReportado,
      estado: t.estado ?? 'Ingresado',
      diagnosticoFinal: t.diagnosticoFinal ?? '',
      solucionAplicada: t.solucionAplicada ?? '',
      precio: t.precio ?? null
    };
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.idEditando.set(null);
  }

  protected guardar(): void {
    if (this.form.idEquipo === null || this.form.idTecnico === null) return;

    const payload = {
      equipo: { idEquipo: Number(this.form.idEquipo) },
      tecnico: { idTecnico: Number(this.form.idTecnico) },
      problemaReportado: this.form.problemaReportado,
      estado: this.form.estado,
      diagnosticoFinal: this.form.diagnosticoFinal,
      solucionAplicada: this.form.solucionAplicada,
      precio: this.form.precio
    };

    const id = this.idEditando();
    const peticion = id !== null
      ? this.api.actualizarTicket(id, payload)
      : this.api.crearTicket(payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.datos.cargarTickets();
        this.cerrarFormulario();
      },
      error: () => {
        this.guardando.set(false);
        alert('No se pudo guardar el ticket. Revisa tu conexión e inténtalo de nuevo.');
      }
    });
  }

  /** Aprobar o rechazar una cotización con un toque. */
  protected cambiarEstado(t: Ticket, nuevoEstado: string): void {
    const payload = {
      equipo: { idEquipo: t.equipo.idEquipo },
      tecnico: { idTecnico: t.tecnico?.idTecnico ?? this.datos.tecnicos()[0]?.idTecnico ?? 1 },
      problemaReportado: t.problemaReportado,
      estado: nuevoEstado,
      diagnosticoFinal: t.diagnosticoFinal,
      solucionAplicada: t.solucionAplicada,
      precio: t.precio
    };
    this.api.actualizarTicket(t.idTicket!, payload).subscribe({
      next: () => this.datos.cargarTickets(),
      error: () => alert('No se pudo cambiar el estado. Inténtalo de nuevo.')
    });
  }

  protected eliminar(t: Ticket): void {
    if (!confirm(`¿Eliminar el ticket #${t.idTicket}? Esta acción no se puede deshacer.`)) return;
    this.api.eliminarTicket(t.idTicket!).subscribe({
      next: () => this.datos.cargarTickets(),
      error: () => alert('No se pudo eliminar el ticket. Inténtalo de nuevo.')
    });
  }
}
