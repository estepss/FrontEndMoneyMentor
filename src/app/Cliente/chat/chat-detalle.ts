import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat-detalle.html',
  styleUrl: './chat-detalle.css'
})
export class ChatDetalleComponent {
  idChat!: number;
  idCliente = Number(localStorage.getItem('idCliente'));
  mensajes: any[] = [];
  nuevoMensaje = '';
  nombreAsesor = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chatService = inject(ChatService);

  ngOnInit() {
    this.idChat = Number(this.route.snapshot.paramMap.get('id'));

    // cargar los mensajes del chat
    this.chatService.listMensajes(this.idChat).subscribe({
      next: (data) => (this.mensajes = data),
      error: (err) => console.error('Error al cargar mensajes:', err)
    });

    // obtener datos del asesor desde el localStorage si los tienes guardados
    const asesorData = localStorage.getItem('asesorNombre');
    if (asesorData) this.nombreAsesor = asesorData;
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    this.chatService
      .enviarMensaje(this.idChat, this.nuevoMensaje, 'CLIENTE')
      .subscribe({
        next: (msg) => {
          this.mensajes.push(msg);
          this.nuevoMensaje = '';
        },
        error: (err) => console.error('Error al enviar mensaje:', err)
      });
  }

  volver() {
    this.router.navigate(['/Chat']);
  }
}

