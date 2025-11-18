import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat-asesor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-asesor.html',
  styleUrl: './chat-asesor.css'
})
export class ChatAsesor {
  chats: any[] = [];
  private chatService = inject(ChatService);
  private router = inject(Router);

  ngOnInit() {
    const idAsesor = Number(localStorage.getItem('idAsesor'));
    if (!idAsesor) return;

    this.chatService.listByAsesor(idAsesor).subscribe({
      next: (data) => (this.chats = data),
      error: (err) => console.error('Error al listar chats:', err)
    });
  }

  abrirChat(chat: any) {
    localStorage.setItem('clienteNombre', chat.cliente.nombre);
    this.router.navigate(['/ChatAsesor/Detalle', chat.idChat]);
  }

  obtenerAvatar(nombre: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=ffffff&color=179bae&bold=true`;
  }
}
