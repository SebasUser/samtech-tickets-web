import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../servicios/api.service';
import { DatosService } from '../../servicios/datos.service';
import { Tecnico } from '../../modelos/modelos';
import { Modal } from '../../compartido/modal';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [FormsModule, Modal],
  templateUrl: './tecnicos.html'
})
export class TecnicosPage {
  private readonly api = inject(ApiService);
  protected readonly datos = inject(DatosService);

  protected readonly formularioAbierto = signal(false);
  protected readonly idEditando = signal<number | null>(null);
  protected readonly modoEdicion = computed(() => this.idEditando() !== null);
  protected readonly guardando = signal(false);
  protected form: Tecnico = { nombre: '', email: '' };

  protected nuevo(): void {
    this.idEditando.set(null);
    this.form = { nombre: '', email: '' };
    this.formularioAbierto.set(true);
  }

  protected editar(t: Tecnico): void {
    this.idEditando.set(t.idTecnico ?? null);
    this.form = { nombre: t.nombre, email: t.email };
    this.formularioAbierto.set(true);
  }

  protected cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.idEditando.set(null);
  }

  protected guardar(): void {
    const id = this.idEditando();
    const peticion = id !== null
      ? this.api.actualizarTecnico(id, this.form)
      : this.api.crearTecnico(this.form);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.datos.cargarTecnicos();
        if (id !== null) this.datos.cargarTickets(); // los tickets muestran el técnico asignado
        this.cerrarFormulario();
      },
      error: () => {
        this.guardando.set(false);
        alert('No se pudo guardar el técnico. Revisa tu conexión e inténtalo de nuevo.');
      }
    });
  }
}
