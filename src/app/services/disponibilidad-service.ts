import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Disponibilidad} from '../model/disponibilidad';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {

  private url = environment.apiUrl; // De environment.ts (ej: 'http://localhost:8080')
  private httpClient = inject(HttpClient);
  private endpoint = '/disponibilidades'; // Endpoint del Controller

  constructor() {}

  // Headers (Si necesitas enviar el Token JWT)
  private getAuthHeaders(): HttpHeaders {
    // Aquí obtienes el token de localStorage, sessionStorage o un AuthService
    const token = localStorage.getItem('token'); // ¡Ajusta esto!
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * POST /api/disponibilidades
   * Llama a: insertar(@RequestBody DisponibilidadDTO disponibilidadDto)
   */
  insert(disponibilidad: Disponibilidad): Observable<Disponibilidad[]> {
    console.log('Servicio: Insertando disponibilidad', disponibilidad);
    return this.httpClient.post<Disponibilidad[]>(
      `${this.url}${this.endpoint}`,
      disponibilidad
      // { headers: this.getAuthHeaders() } // Descomenta si tu endpoint está asegurado
    );
  }

  /**
   * GET /api/disponibilidades
   * Llama a: buscarTodos()
   */
  list(): Observable<Disponibilidad[]> {
    return this.httpClient.get<Disponibilidad[]>(
      `${this.url}${this.endpoint}`
      // { headers: this.getAuthHeaders() } // Descomenta si tu endpoint está asegurado
    );
  }

  /**
   * GET /api/disponibilidades/asesor/{idAsesor}
   * Llama a: buscarPorAsesor(@PathVariable Long idAsesor)
   */
  listByAsesor(idAsesor: number): Observable<Disponibilidad[]> {
    return this.httpClient.get<Disponibilidad[]>(
      `${this.url}${this.endpoint}/asesor/${idAsesor}`
      // { headers: this.getAuthHeaders() } // Descomenta si tu endpoint está asegurado
    );
  }

  /**
   * DELETE /api/disponibilidades/{idDisponibilidad}
   * Llama a: eliminar(@PathVariable Long idDisponibilidad)
   */
  delete(idDisponibilidad: number): Observable<any> {
    return this.httpClient.delete(
      `${this.url}${this.endpoint}/${idDisponibilidad}`
      // { headers: this.getAuthHeaders() } // Descomenta si tu endpoint está asegurado
    );
  }

  /**
   * PUT /api/disponibilidades
   * Llama a: actualizar(@RequestBody DisponibilidadDTO disponibilidadDto)
   */
  update(disponibilidad: Disponibilidad): Observable<Disponibilidad> {
    return this.httpClient.put<Disponibilidad>(
      `${this.url}${this.endpoint}`,
      disponibilidad
      // { headers: this.getAuthHeaders() } // Descomenta si tu endpoint está asegurado
    );
  }
}
