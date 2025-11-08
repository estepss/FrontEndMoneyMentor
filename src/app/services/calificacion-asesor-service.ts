import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private url = environment.apiUrl + '/calificaciones';
  private httpClient = inject(HttpClient);

  insertar(dto: any): Observable<any> {
    return this.httpClient.post(this.url, dto);
  }

  listarPorAsesor(idAsesor: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.url}/asesor/${idAsesor}`);
  }
}
