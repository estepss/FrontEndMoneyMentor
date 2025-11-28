import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ChatIAService } from '../../services/chat-ia-service';

@Component({
  selector: 'app-chat-ia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-ia.html',
  styleUrl: './chat-ia.css'
})
export class ChatIa implements OnInit {

  private groq = inject(ChatIAService);

  form: FormGroup = new FormGroup({
    texto: new FormControl('', Validators.required)
  });

  uiMessages: any[] = [
    { sender: 'bot', text: '¡Hola! Soy WealthyAI. ¿En qué puedo ayudarte hoy?' }
  ];

  generating = false;
  statusText = 'WealthyAI listo';

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.invalid) return;

    const mensaje = this.form.value.texto;
    this.uiMessages.push({ sender: 'user', text: mensaje });
    this.form.reset();

    this.generating = true;
    this.statusText = "WealthyAI escribiendo...";

    this.groq.enviarMensaje(mensaje).subscribe({
      next: (res: any) => {
        const respuesta = res.choices[0].message.content;
        this.uiMessages.push({ sender: 'bot', text: respuesta });
        this.generating = false;
        this.statusText = "WealthyAI listo";
      },
      error: (err) => {
        console.error("ERROR IA:", err);
        console.error("BODY DEL ERROR (JSON):", JSON.stringify(err.error, null, 2));

        this.uiMessages.push({
          sender: 'bot',
          text: "La IA devolvió un error. Revisa la consola."
        });

        this.generating = false;
      }
    });
  }
}
