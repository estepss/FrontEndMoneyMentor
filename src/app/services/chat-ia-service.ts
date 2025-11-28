import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatIAService {

  private apiKey = ""; //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
  private url = "/groq/openai/v1/chat/completions";

  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: string): Observable<any> {

    const body = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: mensaje }
      ]
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    });

    return this.http.post(this.url, body, { headers });
  }
}
