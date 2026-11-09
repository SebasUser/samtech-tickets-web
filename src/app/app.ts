import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatosService } from './servicios/datos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly datos = inject(DatosService);

  protected readonly cargando = this.datos.cargando;
  protected readonly errorConexion = this.datos.errorConexion;

  protected readonly enlaces = [
    { ruta: '/tickets',  icono: '📋', texto: 'Tickets' },
    { ruta: '/equipos',  icono: '💻', texto: 'Equipos' },
    { ruta: '/clientes', icono: '👥', texto: 'Clientes' },
    { ruta: '/tecnicos', icono: '🧰', texto: 'Técnicos' }
  ];

  ngOnInit(): void {
    this.datos.cargarTodo();
  }

  protected reintentar(): void {
    this.datos.cargarTodo();
  }
}
