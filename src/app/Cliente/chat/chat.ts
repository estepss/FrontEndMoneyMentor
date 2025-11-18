import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent {
  chats: any[] = [];
  private chatService = inject(ChatService);
  private router = inject(Router);

  ngOnInit() {
    const idCliente = Number(localStorage.getItem('idCliente'));
    if (!idCliente) return;

    this.chatService.listByCliente(idCliente).subscribe({
      next: (data) => (this.chats = data),
      error: (err) => console.error('Error al listar chats:', err)
    });
  }

  abrirChat(chat: any) {
    localStorage.setItem('asesorNombre', chat.asesor.nombre);
    this.router.navigate(['/Chat/Detalle', chat.idChat]);
  }

  obtenerAvatar(nombre: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=ffffff&color=179bae&bold=true`;
  }
}
