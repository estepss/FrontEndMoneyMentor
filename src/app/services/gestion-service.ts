import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Gestion} from '../gestion/gestion';
import {GestionFinanciera} from '../model/gestion-financiera';

@Injectable({
  providedIn: 'root'
})
export class GestionService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  constructor() { }


  // Listar todas las gestiones
  list(): Observable<GestionFinanciera[]> {
    console.log(this.url + '/gestionfinanciera/listar');
    return this.httpClient.get<GestionFinanciera[]>(`${this.url}/gestionfinanciera/listar`);
  }

  //  Buscar por ID
  listId(id: number): Observable<GestionFinanciera[]> {
    console.log(`${this.url}/gestionfinanciera/listar/${id}`);
    return this.httpClient.get<GestionFinanciera[]>(`${this.url}/gestionfinanciera/listar/${id}`);
  }

  //  Registrar nueva gestión
  insert(gestion: GestionFinanciera): Observable<any> {
    console.log('Insertando gestión:', gestion);
    return this.httpClient.post(`${this.url}/gestionfinanciera`, gestion);
  }


}
