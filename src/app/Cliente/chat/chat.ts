import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat-service';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
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
