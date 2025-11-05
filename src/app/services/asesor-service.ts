import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Cliente} from '../model/cliente';
import {AsesorFinanciero} from '../model/asesor-financiero';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  constructor() { }


  obtenerasesoreporemail(email: string) {
    const enc = encodeURIComponent(email);
    return this.httpClient.get<AsesorFinanciero>(`${this.url}/asesores/email/${enc}`);
  }
}
