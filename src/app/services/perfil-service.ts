import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Perfil} from '../model/perfil';
import {Credenciales} from '../model/credenciales';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  //private listaCambio: Subject<Proveedor[]> = new Subject<Proveedor[]>();

  constructor() { }
  //registro de usuario
  insert(perfil:Perfil) {
    console.log(this.url + "/Login/registro");
    return this.httpClient.post(this.url + "/Login/registro", perfil);
  }

  //listar
  list() : Observable<any> {
    console.log(this.url + "/Login");
    return this.httpClient.get<Perfil[]>(this.url + "/Login"); //aqui toy llamando al endpoint
  }

  //auth
  auth(credenciales: { username: string; password: string }) {
    return this.httpClient.post<{ jwt: string; roles: string[] }>(
      `${this.url}/authenticate`,
      credenciales
    );
  }
}
