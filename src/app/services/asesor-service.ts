import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AsesorFinanciero } from '../model/asesor-financiero';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {
  private url = environment.apiUrl + '/asesores';
  private httpClient = inject(HttpClient);

  constructor() {}

  // 🔹 Listar todos los asesores
  obtenerTodosLosAsesores(): Observable<AsesorFinanciero[]> {
    console.log(`${this.url}/listar`);
    return this.httpClient.get<AsesorFinanciero[]>(`${this.url}/listar`);
  }

  // 🔹 Buscar asesor por email
  obtenerAsesorPorEmail(email: string): Observable<AsesorFinanciero> {
    const enc = encodeURIComponent(email);
    console.log(`${this.url}/email/${enc}`);
    return this.httpClient.get<AsesorFinanciero>(`${this.url}/email/${enc}`);
  }

  // 🔹 Buscar asesor por ID (opcional, si lo necesitas)
  obtenerAsesorPorId(id: number): Observable<AsesorFinanciero> {
    console.log(`${this.url}/${id}`);
    return this.httpClient.get<AsesorFinanciero>(`${this.url}/${id}`);
  }
}
