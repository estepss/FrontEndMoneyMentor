import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private http = inject(HttpClient);

  private baseUrl = environment.apiUrl + '/reservas';


  insertar(reservaDTO: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservas`, reservaDTO);
  }



  listarPorCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cliente/${idCliente}`);
  }

  listarPorAsesor(idAsesor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asesor/${idAsesor}`);
  }

  actualizar(reservaActualizada: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}`, reservaActualizada);
  }


  eliminar(idReserva: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${idReserva}`);
  }
  listarClientesPorAsesor(idAsesor: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/asesor/${idAsesor}/clientes-reservados`);
  }
}
