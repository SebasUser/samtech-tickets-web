import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },
  {
    path: 'tickets',
    title: 'Tickets | Samtech Solutions',
    loadComponent: () => import('./paginas/tickets/tickets').then(m => m.TicketsPage)
  },
  {
    path: 'equipos',
    title: 'Equipos | Samtech Solutions',
    loadComponent: () => import('./paginas/equipos/equipos').then(m => m.EquiposPage)
  },
  {
    path: 'clientes',
    title: 'Clientes | Samtech Solutions',
    loadComponent: () => import('./paginas/clientes/clientes').then(m => m.ClientesPage)
  },
  {
    path: 'tecnicos',
    title: 'Técnicos | Samtech Solutions',
    loadComponent: () => import('./paginas/tecnicos/tecnicos').then(m => m.TecnicosPage)
  },
  { path: '**', redirectTo: 'tickets' }
];
