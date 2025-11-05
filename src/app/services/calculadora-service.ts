// calculadora-service.ts
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

export interface CalculoResultado {
  capitalCuota: number;
  interesCuota: number;
  cuota: number;
  capitalTotal: number;
  interesTotal: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  calculo(monto: number, cuotas: number, tasa: number) {
    const url = `${this.url}/calculadora/calcular/${monto}/${cuotas}/${tasa}`;
    const token = localStorage.getItem('token'); // o desde tu AuthService
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
    return this.http.get<CalculoResultado>(url, {headers, withCredentials: true});
  }
}
