import { Component, computed, input } from '@angular/core';
import { claseEstado } from './estados';

@Component({
  selector: 'app-estado',
  standalone: true,
  template: `<span class="ed-status" [class]="clase()">{{ estado() }}</span>`
})
export class EstadoBadge {
  estado = input<string | undefined>();
  clase = computed(() => claseEstado(this.estado()));
}
