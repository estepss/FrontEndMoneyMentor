import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel

// Interfaz para el objeto Tarjeta
interface Tarjeta2 {
  nombre: string;
  numero: string;
  mesExpiracion: string;
  anioExpiracion: string;
  cvc: string;
}
@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importamos FormsModule
  templateUrl: './tarjeta.html',
  styleUrl: './tarjeta.css'
})
export class Tarjeta {
  // Estado para la nueva tarjeta que se va a agregar
  nuevaTarjeta: Tarjeta2 = { // Tipo Tarjeta2
    nombre: 'Fernando Velarde', // Rellenado inicial basado en el mockup
    numero: '3333 4444 5555 6666',
    mesExpiracion: 'Septiembre',
    anioExpiracion: '2025',
    cvc: '111',
  };

  // Lista de tarjetas añadidas (Almacenamiento temporal)
  tarjetasAgregadas: Tarjeta2[] = []; // <-- CORRECCIÓN: Ahora es Tarjeta2[]

  // Estado para controlar qué vista mostrar: 'agregar' o 'lista'
  vistaActual: 'agregar' | 'lista' = 'agregar';

  // Opciones para los select (basado en el mockup)
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anios: string[] = ['2024', '2025', '2026', '2027', '2028'];


  /**
   * Agrega la tarjeta actual a la lista y limpia el formulario.
   */
  agregarTarjeta(): void {
    // Aquí puedes añadir lógica de validación real (ej. número de 16 dígitos)
    if (this.nuevaTarjeta.nombre && this.nuevaTarjeta.numero) {
      // Usamos el operador spread para clonar el objeto y evitar problemas de referencia
      this.tarjetasAgregadas.push({...this.nuevaTarjeta});

      // Mostrar la lista después de agregar la tarjeta
      this.vistaActual = 'lista';
    } else {
      console.error('Por favor, complete los campos obligatorios.');
    }
  }

  /**
   * Elimina una tarjeta de la lista.
   */
  eliminarTarjeta(index: number): void {
    this.tarjetasAgregadas.splice(index, 1);
  }

  /**
   * Cambia la vista a la lista de tarjetas.
   */
  mostrarLista(): void {
    this.vistaActual = 'lista';
  }

  /**
   * Cambia la vista al formulario de agregar tarjeta.
   */
  mostrarAgregar(): void {
    this.vistaActual = 'agregar';
  }

}
