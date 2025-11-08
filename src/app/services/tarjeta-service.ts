import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Tarjeta} from '../model/tarjeta'; // Importamos tu CLASE Tarjeta

@Injectable({
  providedIn: 'root'
})
export class TarjetaService {

  // Usamos la URL base del archivo environment
  private url:string = environment.apiUrl;
  private httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Llama a: GET /api/tarjetas (Tu método 'listar()')
   */
  list(): Observable<Tarjeta[]>{
    // Concatenamos la URL base + el endpoint específico
    const apiUrl = `${this.url}/tarjetas`;
    console.log("Llamando a API (GET):", apiUrl);
    return this.httpClient.get<Tarjeta[]>(apiUrl);
  }

  /**
   * Llama a: POST /api/tarjetas (Tu método 'insertar()')
   */
  insert(tarjeta: Tarjeta): Observable<Tarjeta> {
    const apiUrl = `${this.url}/tarjetas`;
    console.log("Enviando a API (POST):", tarjeta);
    return this.httpClient.post<Tarjeta>(apiUrl, tarjeta);
  }

  /**
   * Llama a: DELETE /api/tarjetas/{id} (Tu método 'eliminar()')
   */
  delete(id: number): Observable<any> {
    const apiUrl = `${this.url}/tarjetas/${id}`;
    console.log("Llamando a API (DELETE):", apiUrl);
    return this.httpClient.delete(apiUrl);
  }

  // (Si en el futuro necesitas 'update' o 'listId', los añades aquí)
}
