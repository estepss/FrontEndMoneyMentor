import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Asesor {
  id: number;
  nombre: string;
  textoPrincipal: string;
  imagenUrl: string;
  experiencia: number;
}

@Component({
  selector: 'app-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asesor.html',
  styleUrls: ['./asesor.css'],
})
export class AsesorComponent {
  asesores: Asesor[] = [
    {
      id: 1,
      nombre: 'Eleanor Villanueva',
      textoPrincipal: '¿Cuál es su estrategia de ahorro favorita?',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=EV',
      experiencia: 3,
    },
    {
      id: 2,
      nombre: 'Alejandro Almonte',
      textoPrincipal:
        '¿Cuándo es el momento adecuado para empezar a planificar para la jubilación?',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=AA',
      experiencia: 2,
    },
    {
      id: 3,
      nombre: 'Carlos Rodriguez',
      textoPrincipal:
        'Yo prefiero automatizar mis ahorros cada mes para asegurarme de no gastar de más.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=CR',
      experiencia: 4,
    },
    {
      id: 4,
      nombre: 'Kenji Nakamura',
      textoPrincipal:
        'Es importante empezar lo antes posible, pero nunca es tarde para empezar a ahorrar e invertir para el futuro.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=KN',
      experiencia: 6,
    },
    {
      id: 5,
      nombre: 'Roberto Saenz',
      textoPrincipal:
        'Invierto en acciones de empresas sólidas para hacer crecer mi dinero a largo plazo.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=RS',
      experiencia: 5,
    },
    {
      id: 6,
      nombre: 'Mari Marin',
      textoPrincipal:
        'Empecé a planificar para la jubilación en mis 20 años para aprovechar al máximo el poder del interés compuesto.',
      imagenUrl: 'https://placehold.co/150x150/f0f9ff/0f172a?text=MM',
      experiencia: 3,
    },
  ];

  // ✅ Simulación de reseñas existentes
  resenas: Record<number, any[]> = {
    1: [
      {
        cliente: 'Alejandro Almonte',
        puntuacion: 5,
        comentario: 'Muy recomendada, me ayudó en todo.',
      },
      {
        cliente: 'Sonia Soto',
        puntuacion: 4,
        comentario: 'Me ayudó a registrar mis ingresos y gastos en Excel.',
      },
    ],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  mostrarModal = false;
  asesorSeleccionado: Asesor | null = null;
  nuevaResena = { puntuacion: 0, comentario: '' };

  abrirModal(asesor: Asesor) {
    this.asesorSeleccionado = asesor;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevaResena = { puntuacion: 0, comentario: '' };
  }

  enviarResena() {
    if (
      !this.nuevaResena.puntuacion ||
      this.nuevaResena.puntuacion < 1 ||
      this.nuevaResena.puntuacion > 5
    ) {
      alert('Debe seleccionar una calificación del 1 al 5.');
      return;
    }

    if (
      !this.nuevaResena.comentario ||
      this.nuevaResena.comentario.length < 5
    ) {
      alert('El comentario debe tener al menos 5 caracteres.');
      return;
    }

    if (!this.asesorSeleccionado) return;

    const nueva = {
      cliente: 'Usuario Actual',
      puntuacion: this.nuevaResena.puntuacion,
      comentario: this.nuevaResena.comentario,
    };

    const id = this.asesorSeleccionado.id;
    if (!this.resenas[id]) {
      this.resenas[id] = [];
    }

    this.resenas[id].push(nueva);
    this.nuevaResena = { puntuacion: 0, comentario: '' };
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto';
    }
  }
}
