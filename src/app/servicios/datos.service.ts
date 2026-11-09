import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cliente, Equipo, Tecnico, Ticket } from '../modelos/modelos';

/**
 * Guarda en un solo lugar las listas (tickets, equipos, clientes, técnicos)
 * y los KPIs, para que todas las páginas compartan los mismos datos.
 */
@Injectable({ providedIn: 'root' })
export class DatosService {
  private readonly api = inject(ApiService);

  readonly tickets = signal<Ticket[]>([]);
  readonly equipos = signal<Equipo[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly tecnicos = signal<Tecnico[]>([]);

  readonly cargando = signal(true);
  readonly errorConexion = signal(false);

  // --- KPIs ---
  readonly ticketsEnTaller = computed(() =>
    this.tickets().filter(t => t.estado !== 'Entregado' && t.estado !== 'Rechazado / Devuelto').length
  );

  readonly ticketsEsperandoAprobacion = computed(() =>
    this.tickets().filter(t => t.estado === 'Esperando Aprobación').length
  );

  readonly ingresosTotales = computed(() =>
    this.tickets()
      .filter(t => t.estado === 'Entregado' || t.estado === 'Reparado')
      .reduce((acc, t) => acc + (Number(t.precio) || 0), 0)
  );

  /** Carga inicial: avisa cuando terminan las 4 peticiones (o si alguna falla). */
  cargarTodo(): void {
    this.cargando.set(true);
    this.errorConexion.set(false);

    let pendientes = 4;
    const terminar = () => {
      pendientes -= 1;
      if (pendientes === 0) this.cargando.set(false);
    };
    const alFallar = () => {
      this.errorConexion.set(true);
      terminar();
    };

    this.api.listarTickets().subscribe({ next: d => { this.tickets.set(d); terminar(); }, error: alFallar });
    this.api.listarEquipos().subscribe({ next: d => { this.equipos.set(d); terminar(); }, error: alFallar });
    this.api.listarClientes().subscribe({ next: d => { this.clientes.set(d); terminar(); }, error: alFallar });
    this.api.listarTecnicos().subscribe({ next: d => { this.tecnicos.set(d); terminar(); }, error: alFallar });
  }

  // --- Recargas individuales (después de crear / editar / eliminar) ---
  cargarTickets(): void { this.recargar(this.api.listarTickets(), d => this.tickets.set(d)); }
  cargarEquipos(): void { this.recargar(this.api.listarEquipos(), d => this.equipos.set(d)); }
  cargarClientes(): void { this.recargar(this.api.listarClientes(), d => this.clientes.set(d)); }
  cargarTecnicos(): void { this.recargar(this.api.listarTecnicos(), d => this.tecnicos.set(d)); }

  private recargar<T>(peticion: Observable<T>, guardar: (datos: T) => void): void {
    peticion.subscribe({
      next: guardar,
      error: () => this.errorConexion.set(true)
    });
  }
}
