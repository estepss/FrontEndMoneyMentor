import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoticiasFinancierasService {
  private baseUrl = 'https://finnhub.io/api/v1/news?category=general&token=KEY\n';
  private apiKey = 'd4itglhr01queuakgtbgd4itglhr01queuakgtc0'; //

  constructor(private http: HttpClient) {}

  getLatestNews(): Observable<any> {
    return this.http.get(`/finnhub/news?category=general&token=${this.apiKey}`);
  }
}
