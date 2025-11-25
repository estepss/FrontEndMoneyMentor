import { Component, inject, OnInit } from '@angular/core';
import { ReservaService } from '../../services/reserva-service';
import { CommonModule } from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {ChatService} from '../../services/chat-service';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, MatIcon, MatButton],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  animations: [
    trigger('tileEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate(
          '350ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        )
      ])
    ])
  ]
})
export class Clientes implements OnInit {

  reservaService = inject(ReservaService);
  chatService = inject(ChatService);
  clientes: any[] = [];
  cargando = true;
  router = inject(Router);

  ngOnInit(): void {
    this.cargarClientes();
  }
  irAlChat(idCliente: number) {
    const idAsesor = Number(localStorage.getItem('idAsesor'));

    if (!idAsesor) {
      alert("No se encontró el ID del asesor.");
      return;
    }
    this.chatService.getChatClienteAsesor(idCliente, idAsesor).subscribe({
      next: (lista) => {
        if (!lista || lista.length === 0) {
          alert("Aún no existe una conversación con este cliente.");
          return;
        }

        const chat = lista[0];
        this.router.navigate(['/ChatAsesor/Detalle', chat.idChat]);
      },
      error: (err) => {
        console.error("Error obteniendo chat:", err);
        alert("Error buscando la conversación.");
      }
    });
  }
  cargarClientes() {
    this.reservaService.getClientesConReservas().subscribe({
      next: (data) => {
        console.log("CLIENTES RECIBIDOS:", data);
        this.clientes = data ?? [];
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando clientes:", err);
        this.cargando = false;
        alert("No se pudieron cargar los clientes.");
      }
    });
  }
}
