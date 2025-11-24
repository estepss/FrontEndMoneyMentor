import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Tarjeta} from '../model/tarjeta'; // Importamos tu CLASE Tarjeta

@Injectable({
  providedIn: 'root'
})
export class TarjetaService {


  private url:string = environment.apiUrl;
  private httpClient = inject(HttpClient);

  constructor() {}


  list(): Observable<Tarjeta[]>{
    // Concatenamos la URL base + el endpoint específico
    const apiUrl = `${this.url}/tarjetas`;
    console.log("Llamando a API (GET):", apiUrl);
    return this.httpClient.get<Tarjeta[]>(apiUrl);
  }

  listPorCliente(idCliente: number): Observable<Tarjeta[]> {
    const apiUrl = `${this.url}/tarjetas/cliente/${idCliente}`;
    console.log("Consultando tarjetas del cliente:", idCliente);
    return this.httpClient.get<Tarjeta[]>(apiUrl);
  }

  insert(tarjeta: Tarjeta): Observable<Tarjeta> {
    const apiUrl = `${this.url}/tarjetas`;
    console.log("Enviando a API (POST):", tarjeta);
    return this.httpClient.post<Tarjeta>(apiUrl, tarjeta);
  }

  delete(id: number): Observable<any> {
    const apiUrl = `${this.url}/tarjetas/${id}`;
    console.log("Llamando a API (DELETE):", apiUrl);
    return this.httpClient.delete(apiUrl);
  }


}
