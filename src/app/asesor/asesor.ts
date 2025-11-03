import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Definición de la interfaz simplificada
interface Asesor2 {
  nombre: string;
  textoPrincipal: string; // Campo unificado para pregunta o respuesta
  imagenUrl: string;
}

@Component({
  selector: 'app-asesor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesor.html',
  styleUrl: './asesor.css'
})
// El nombre de la clase es AsesorComponent
export class Asesor {
  // 2. Datos de prueba unificados
  asesores: Asesor2[] = [
    {
      nombre: 'Eleanor Villanueva',
      // Manteniendo el texto original de la pregunta
      textoPrincipal: '¿Cuál es su estrategia de ahorro favorita?',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=EV',
    },
    {
      nombre: 'Alejandro Almonte',
      // Manteniendo el texto original de la pregunta
      textoPrincipal: '¿Cuándo es el momento adecuado para empezar a planificar para la jubilación?',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=AA',
    },
    {
      nombre: 'Carlos Rodriguez',
      // Usando el texto de la respuesta como texto principal
      textoPrincipal: 'Yo prefiero automatizar mis ahorros cada mes para asegurarme de no gastar de más.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=CR',
    },
    {
      nombre: 'Kenji Nakamura',
      // Usando el texto de la respuesta como texto principal
      textoPrincipal: 'Es importante empezar lo antes posible, pero nunca es tarde para empezar a ahorrar e invertir para el futuro.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=KN',
    },
    {
      nombre: 'Roberto Saenz',
      // Usando el texto de la respuesta como texto principal
      textoPrincipal: 'Invierto en acciones de empresas sólidas para hacer crecer mi dinero a largo plazo.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=RS',
    },
    {
      nombre: 'Mari Marin',
      // Usando el texto de la respuesta como texto principal
      textoPrincipal: 'Empecé a planificar para la jubilación en mis 20 años para aprovechar al máximo el poder del interés compuesto.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=MM',
    }
  ];

  // Mantener la función de acción por si se usa en el click
  accionAsesor(asesor: Asesor2): void {
    console.log(`Reserva solicitada para ${asesor.nombre}`);
  }
}
