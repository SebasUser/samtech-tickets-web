import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../servicios/api.service';
import { DatosService } from '../../servicios/datos.service';
import { Equipo } from '../../modelos/modelos';
import { Modal } from '../../compartido/modal';

interface FormEquipo {
  idCliente: number | null;
  codigotek: string;
  tipo: string;
  marcaModelo: string;
  numeroSerie: string;
  detallesTecnicos: string;
}

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [FormsModule, RouterLink, Modal],
  templateUrl: './equipos.html'
})
export class EquiposPage {
  private readonly api = inject(ApiService);
  protected readonly datos = inject(DatosService);

  protected readonly tipos = [
    { valor: 'Laptop', etiqueta: 'Laptop' },
    { valor: 'Desktop', etiqueta: 'Desktop / PC' },
    { valor: 'All-in-One', etiqueta: 'All-in-One' },
    { valor: 'Impresora', etiqueta: 'Impresora' }
  ];

  protected readonly busqueda = signal('');
  protected readonly equiposFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.datos.equipos();
    return this.datos.equipos().filter(eq =>
      [eq.codigotek, eq.marcaModelo, eq.numeroSerie, eq.cliente.nombreCompleto]
        .some(valor => (valor ?? '').toLowerCase().includes(q))
    );
  });

  protected readonly formularioAbierto = signal(false);
  protected readonly idEditando = signal<number | null>(null);
  protected readonly modoEdicion = computed(() => this.idEditando() !== null);
  protected readonly guardando = signal(false);
  protected form: FormEquipo = this.formularioVacio();

  private formularioVacio(): FormEquipo {
    return { idCliente: null, codigotek: '', tipo: 'Laptop', marcaModelo: '', numeroSerie: '', detallesTecnicos: '' };
  }

  protected nuevo(): void {
    this.idEditando.set(null);
    this.form = this.formularioVacio();
    this.form.idCliente = this.datos.clientes()[0]?.idCliente ?? null;
    this.formularioAbierto.set(true);
  }

  protected editar(eq: Equipo): void {
    this.idEditando.set(eq.idEquipo ?? null);
    this.form = {
      idCliente: eq.cliente.idCliente ?? null,
      codigotek: eq.codigotek,
      tipo: eq.tipo,
      marcaModelo: eq.marcaModelo,
      numeroSerie: eq.numeroSerie ?? '',
      detallesTecnicos: eq.detallesTecnicos ?? ''
    };
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.idEditando.set(null);
  }

  protected guardar(): void {
    if (this.form.idCliente === null) return;

    const payload = {
      cliente: { idCliente: Number(this.form.idCliente) },
      codigotek: this.form.codigotek,
      tipo: this.form.tipo,
      marcaModelo: this.form.marcaModelo,
      numeroSerie: this.form.numeroSerie,
      detallesTecnicos: this.form.detallesTecnicos
    };

    const id = this.idEditando();
    const peticion = id !== null
      ? this.api.actualizarEquipo(id, payload)
      : this.api.crearEquipo(payload);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.datos.cargarEquipos();
        if (id !== null) this.datos.cargarTickets(); // los tickets muestran los datos del equipo
        this.cerrarFormulario();
      },
      error: () => {
        this.guardando.set(false);
        alert('No se pudo guardar el equipo. Verifica que el Código Tek no esté repetido.');
      }
    });
  }
}
