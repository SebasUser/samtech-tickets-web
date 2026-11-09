import { Component, HostListener, OnDestroy, OnInit, input, output } from '@angular/core';

/**
 * Ventana reutilizable:
 *  - móvil: hoja que sube desde abajo
 *  - escritorio: ventana centrada, o panel lateral si [lateral]="true"
 * Los botones de acción se proyectan con un elemento que tenga el atributo "pie".
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="overlay" (click)="cerrar.emit()"></div>
    <section class="sheet" [class.sheet-lateral]="lateral()" role="dialog" aria-modal="true" [attr.aria-label]="titulo()">
      <header class="sheet-header">
        <h2>{{ titulo() }}</h2>
        <button type="button" class="btn-icono" aria-label="Cerrar" (click)="cerrar.emit()">✕</button>
      </header>
      <div class="sheet-body"><ng-content /></div>
      <footer class="sheet-footer"><ng-content select="[pie]" /></footer>
    </section>
  `
})
export class Modal implements OnInit, OnDestroy {
  titulo = input.required<string>();
  lateral = input(false);
  cerrar = output<void>();

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrar.emit();
  }

  ngOnInit(): void {
    document.body.classList.add('sin-scroll');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('sin-scroll');
  }
}
