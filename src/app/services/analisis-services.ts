import {HttpClient, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalisisService {
  private baseUrl = 'http://localhost:8080/api/gestionfinanciera';

  constructor(private http: HttpClient) {}

  obtenerGraficoPorTipo(tipo: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/por-tipo.png/${tipo}`, {
      responseType: 'blob' as const,
      observe: 'response'
    });
  }
  obtenerGraficoPorFecha(fecha: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/por-fecha.png/${fecha}`, {
      responseType: 'blob' as const,
      observe: 'response'
    });
  }
}
