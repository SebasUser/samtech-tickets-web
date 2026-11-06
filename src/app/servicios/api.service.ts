import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, Equipo, Tecnico, Ticket } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // --- TICKETS ---
  listarTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets`);
  }

  buscarTicketsPorCodigotek(codigotek: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/codigotek/${codigotek}`);
  }

  crearTicket(ticket: any): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets`, ticket);
  }

  actualizarTicket(id: number, ticket: any): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/tickets/${id}`, ticket);
  }

  eliminarTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tickets/${id}`);
  }

  // --- EQUIPOS ---
  listarEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.baseUrl}/equipos`);
  }

  crearEquipo(equipo: any): Observable<Equipo> {
    return this.http.post<Equipo>(`${this.baseUrl}/equipos`, equipo);
  }

  actualizarEquipo(id: number, equipo: any): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.baseUrl}/equipos/${id}`, equipo);
  }

  // --- CLIENTES ---
  listarClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`);
  }

  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, cliente);
  }

  actualizarCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}`, cliente);
  }

  // --- TÉCNICOS ---
  listarTecnicos(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.baseUrl}/tecnicos`);
  }

  crearTecnico(tecnico: Tecnico): Observable<Tecnico> {
    return this.http.post<Tecnico>(`${this.baseUrl}/tecnicos`, tecnico);
  }

  actualizarTecnico(id: number, tecnico: Tecnico): Observable<Tecnico> {
    return this.http.put<Tecnico>(`${this.baseUrl}/tecnicos/${id}`, tecnico);
  }
}