import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat-asesor-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './chat-asesor-detalle.html',
  styleUrl: './chat-asesor-detalle.css'
})
export class ChatAsesorDetalle {
  idChat!: number;
  idAsesor = Number(localStorage.getItem('idAsesor'));
  mensajes: any[] = [];
  nuevoMensaje = '';
  nombreCliente = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chatService = inject(ChatService);

  ngOnInit() {
    this.idChat = Number(this.route.snapshot.paramMap.get('id'));

    this.chatService.listMensajes(this.idChat).subscribe({
      next: (data) => (this.mensajes = data),
      error: (err) => console.error('Error al obtener mensajes:', err)
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    this.chatService.enviarMensaje(this.idChat, this.nuevoMensaje, 'ASESOR').subscribe({
      next: (msg) => {
        this.mensajes.push(msg);
        this.nuevoMensaje = '';
      },
      error: (err) => console.error('Error al enviar mensaje:', err)
    });
  }

  volver() {
    this.router.navigate(['/ChatAsesor']);
  }
}
