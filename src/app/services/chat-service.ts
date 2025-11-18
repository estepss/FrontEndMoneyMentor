import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const baseUrl = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  // 🔹 Listar todos los chats de un cliente
  listByCliente(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/chats/cliente/${idCliente}`);
  }

  // 🔹 Listar todos los chats de un asesor
  listByAsesor(idAsesor: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/chats/asesor/${idAsesor}`);
  }

  // 🔹 Obtener o crear chat
  getOrCreateChat(idCliente: number, idAsesor: number): Observable<any> {
    return this.http.post(`${baseUrl}/chats`, {
      cliente: { idCliente },
      asesor: { idAsesor },
    });
  }

  // 🔹 Listar mensajes por chat
  listMensajes(idChat: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/mensajes/chat/${idChat}`);
  }

  // 🔹 Enviar mensaje
  enviarMensaje(idChat: number, contenido: string, emisor: string): Observable<any> {
    return this.http.post(`${baseUrl}/mensajes`, {
      idChat,
      contenido,
      emisor,
    });
  }
  getChatClienteAsesor(idCliente: number, idAsesor: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/chats/conversacion/${idCliente}/${idAsesor}`);
  }
}

