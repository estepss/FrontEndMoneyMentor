import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Credenciales} from '../model/credenciales';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);
  constructor() { }

  login(requestDto: Credenciales): Observable<any> {
    // Mapea email del form -> username que espera el backend
    const payload = {
      username: requestDto.email, // clave
      password: requestDto.password,
    };

    return this.http.post<any>(`${this.url}/authenticate`, payload, {
      observe: 'response',
      headers: { 'Content-Type': 'application/json' },
    })
      .pipe(
        map((response) => {
          const body = response.body ?? {};
          // Backend retorna el token en el BODY como "jwt"
          const token = body.jwt || body.token || '';
          if (token) localStorage.setItem('token', token);
          return body; // { jwt, roles, userId, ... }
        })
      );
  }

  getToken(){
    return localStorage.getItem('token');
  }
}
