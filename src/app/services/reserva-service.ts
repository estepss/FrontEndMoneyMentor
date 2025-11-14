import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private http = inject(HttpClient);
  private url = environment.apiUrl + '/reservas/reservas';

  insertar(reservaDTO: any): Observable<any> {
    return this.http.post<any>(this.url, reservaDTO);
  }

  listarPorCliente(idCliente: number) {
    return this.http.get<any[]>(`${environment.apiUrl}/reservas/cliente/${idCliente}`);
  }
}
