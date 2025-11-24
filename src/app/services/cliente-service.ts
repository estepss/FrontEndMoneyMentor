import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Cliente} from '../model/cliente';
import {AsesorFinanciero} from '../model/asesor-financiero';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  constructor() { }
  //  Buscar por ID
  listId(id: number): Observable<Cliente> {
    console.log(`${this.url}/clientes/listar/${id}`);
    return this.httpClient.get<Cliente>(`${this.url}/clientes/listar/${id}`);
  }

  //email
  obtenerclienteporEmail(email: string) {
    const enc = encodeURIComponent(email);
    return this.httpClient.get<Cliente>(`${this.url}/clientes/email/${enc}`);
  }

}
