import {Component, OnInit, ViewChild} from '@angular/core';
import {NoticiasFinancierasService} from '../../services/noticias-financieras-service';
import {DatePipe, NgIf} from '@angular/common';
import { CommonModule } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-noticias-financieras',
  imports: [
    HttpClientModule,
    CommonModule,
    DatePipe,
    NgIf,
    MatPaginator
  ],
  templateUrl: './noticiasfinancierasasesor.html',
  styleUrl: './noticiasfinancierasasesor.css',
  animations: [
    // anima toda la página al cargar
    trigger('pageFadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ]),
    // stagger en las cards de noticias
    trigger('cardsStagger', [
      transition(':enter', [
        query('.news-card', [
          style({ opacity: 0, transform: 'translateY(8px)' }),
          stagger(40, [
            animate('220ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class Noticiasfinancierasasesor implements OnInit {

  // todas las noticias de la API
  noticias: any[] = [];

  // filtradas por búsqueda
  noticiasFiltradas: any[] = [];

  // las que se muestran en la página actual
  paginatedNoticias: any[] = [];

  cargando = true;
  terminoBusqueda = '';

  // paginator
  pageIndex = 0;
  pageSize = 5;
  length = 0;                  // total de noticias filtradas
  pageSizeOptions = [5];

  constructor(private newsService: NoticiasFinancierasService) {}

  ngOnInit(): void {
    this.newsService.getLatestNews().subscribe({
      next: (data) => {
        this.noticias = data;
        this.aplicarFiltro();     // inicializa filtro + paginación
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando noticias', err);
        this.cargando = false;
      }
    });
  }

  // filtra por titular / fuente / resumen
  aplicarFiltro(): void {
    const term = this.terminoBusqueda.toLowerCase().trim();

    if (!term) {
      this.noticiasFiltradas = [...this.noticias];
    } else {
      this.noticiasFiltradas = this.noticias.filter(n =>
        (n.headline || '').toLowerCase().includes(term) ||
        (n.source   || '').toLowerCase().includes(term) ||
        (n.summary  || '').toLowerCase().includes(term)
      );
    }

    this.length = this.noticiasFiltradas.length;
    this.actualizarPagina();
  }

  onSearch(value: string): void {
    this.terminoBusqueda = value;
    this.aplicarFiltro();
  }

  actualizarPagina(): void {
    const start = this.pageIndex * this.pageSize;
    const end   = start + this.pageSize;
    this.paginatedNoticias = this.noticiasFiltradas.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.actualizarPagina();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
