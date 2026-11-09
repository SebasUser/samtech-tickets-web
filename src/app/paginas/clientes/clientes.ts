import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../servicios/api.service';
import { DatosService } from '../../servicios/datos.service';
import { Cliente } from '../../modelos/modelos';
import { Modal } from '../../compartido/modal';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, Modal],
  templateUrl: './clientes.html'
})
export class ClientesPage {
  private readonly api = inject(ApiService);
  protected readonly datos = inject(DatosService);

  protected readonly busqueda = signal('');
  protected readonly clientesFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.datos.clientes();
    return this.datos.clientes().filter(c =>
      [c.nombreCompleto, c.telefono, c.email].some(valor => (valor ?? '').toLowerCase().includes(q))
    );
  });

  protected readonly formularioAbierto = signal(false);
  protected readonly idEditando = signal<number | null>(null);
  protected readonly modoEdicion = computed(() => this.idEditando() !== null);
  protected readonly guardando = signal(false);
  protected form: Cliente = { nombreCompleto: '', telefono: '', email: '' };

  protected nuevo(): void {
    this.idEditando.set(null);
    this.form = { nombreCompleto: '', telefono: '', email: '' };
    this.formularioAbierto.set(true);
  }

  protected editar(c: Cliente): void {
    this.idEditando.set(c.idCliente ?? null);
    this.form = { nombreCompleto: c.nombreCompleto, telefono: c.telefono, email: c.email };
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.idEditando.set(null);
  }

  protected guardar(): void {
    const id = this.idEditando();
    const peticion = id !== null
      ? this.api.actualizarCliente(id, this.form)
      : this.api.crearCliente(this.form);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.datos.cargarClientes();
        if (id !== null) {
          // equipos y tickets muestran los datos del cliente
          this.datos.cargarEquipos();
          this.datos.cargarTickets();
        }
        this.cerrarFormulario();
      },
      error: () => {
        this.guardando.set(false);
        alert('No se pudo guardar el cliente. Revisa tu conexión e inténtalo de nuevo.');
      }
    });
  }
}
