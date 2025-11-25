import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Perfil} from '../model/perfil';
import {Credenciales} from '../model/credenciales';
import {Cliente} from '../model/cliente';

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

  update(userid:number, perfil: Perfil): Observable<any> {
    return this.httpClient.put(`${this.url}/Login/actualizar/${userid}`, perfil);
  }
  //  Buscar por ID
  listId(id: number): Observable<Perfil> {
    console.log(`${this.url}/Login/listarid/${id}`);
    return this.httpClient.get<Perfil>(`${this.url}/Login/listarid/${id}`);
  }

  //email
  obtenerclienteporEmail(email: string) {
    const enc = encodeURIComponent(email);
    return this.httpClient.get<Perfil>(`${this.url}/Login/email/${enc}`);
  }

  subirFoto(userId: number, file: File): Observable<Perfil> {
    const formData = new FormData();
    formData.append('file', file); // 👈 el nombre "file" debe ser el mismo del @RequestParam

    return this.httpClient.post<Perfil>(
      `${this.url}/Login/perfil/${userId}/foto`,
      formData
    );
  }
}
