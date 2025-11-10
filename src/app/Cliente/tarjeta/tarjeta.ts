import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// 1. Importamos el NUEVO SERVICIO y el MODELO (Clase)
// Esta importación ya no causará conflicto
import { Tarjeta } from '../../model/tarjeta';
import {TarjetaService} from '../../services/tarjeta-service';

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './tarjeta.html',
  styleUrl: './tarjeta.css'
})
export class TarjetaComponent implements OnInit {

  // 2. Inyectamos el servicio (como tu profesor)
  private tarjetaService = inject(TarjetaService);

  // 3. 'nuevaTarjeta' ahora es una instancia de la CLASE Tarjeta
  nuevaTarjeta: Tarjeta = new Tarjeta();

  // 4. 'tarjetasAgregadas' usará la CLASE Tarjeta
  tarjetasAgregadas: Tarjeta[] = [];

  vistaActual: 'agregar' | 'lista' = 'agregar';

  // (Tus arrays de meses y años para los <select> están perfectos)
  meses: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  anios: number[] = [2024, 2025, 2026, 2027, 2028];
  mesesNombres: { [key: number]: string } = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
  };

  constructor() {
    // 5. Asignamos los valores por defecto del mockup al formulario
    this.resetearFormulario();
  }

  ngOnInit(): void {
    // Al iniciar, cargamos la lista de tarjetas (si la vista es 'lista')
    // Opcionalmente, puedes mover cargarTarjetas() a mostrarLista()
    this.cargarTarjetas();
  }

  /**
   * NUEVO: Carga la lista de tarjetas desde el backend
   */
  cargarTarjetas(): void {
    this.tarjetaService.list().subscribe({
      next: (tarjetas) => {
        this.tarjetasAgregadas = tarjetas;
        console.log('Tarjetas cargadas desde la BD:', tarjetas);
      },
      error: (err) => {
        console.error('Error al cargar la lista de tarjetas:', err);
      }
    });
  }

  /**
   * MODIFICADO: Llama al servicio 'insert()'
   */
  agregarTarjeta(): void {
    // Validaciones básicas (tu DTO de Java manejará el resto)
    if (!this.nuevaTarjeta.nombreTarjeta || !this.nuevaTarjeta.numeroTarjeta) {
      console.error('Por favor, complete los campos obligatorios.');
      return;
    }

    // Quitamos espacios del número de tarjeta antes de enviar
    this.nuevaTarjeta.numeroTarjeta = this.nuevaTarjeta.numeroTarjeta.replace(/\s/g, '');

    this.tarjetaService.insert(this.nuevaTarjeta).subscribe({
      next: (tarjetaGuardada) => {
        console.log('Tarjeta guardada exitosamente en BD:', tarjetaGuardada);
        // Si se guarda, recargamos la lista desde la BD
        this.cargarTarjetas();
        this.vistaActual = 'lista';
        this.resetearFormulario(); // Limpiamos el formulario
      },
      error: (err) => {
        console.error('Error al guardar la tarjeta en el backend:', err);
        // Aquí puedes manejar errores de validación (ej. 400 Bad Request)
        if (err.status === 400) {
          // err.error contiene los mensajes de @NotBlank, @Pattern, etc.
          console.error('Errores de validación:', err.error);
        }
      }
    });
  }

  /**
   * MODIFICADO: Llama al servicio 'delete()'
   */
  eliminarTarjeta(index: number): void {
    const tarjetaAEliminar = this.tarjetasAgregadas[index];

    if (!tarjetaAEliminar.idTarjeta) {
      console.error('Error: No se puede eliminar una tarjeta sin ID.');
      return;
    }

    this.tarjetaService.delete(tarjetaAEliminar.idTarjeta).subscribe({
      next: () => {
        console.log(`Tarjeta ${tarjetaAEliminar.idTarjeta} eliminada de la BD.`);
        // Si se borra de la BD, la quitamos del array local (o recargamos la lista)
        this.tarjetasAgregadas.splice(index, 1);
      },
      error: (err) => {
        console.error(`Error al eliminar la tarjeta ${tarjetaAEliminar.idTarjeta}:`, err);
      }
    });
  }

  /**
   * MODIFICADO: Carga los datos al cambiar de vista
   */
  mostrarLista(): void {
    this.vistaActual = 'lista';
    this.cargarTarjetas(); // Carga los datos frescos de la BD
  }

  mostrarAgregar(): void {
    this.vistaActual = 'agregar';
    this.resetearFormulario(); // Resetea el formulario si vuelve a agregar
  }

  /**
   * NUEVO: Resetea el formulario a los valores del mockup
   */
  resetearFormulario(): void {
    this.nuevaTarjeta = new Tarjeta(); // Llama al constructor
    // Sobrescribimos con los datos del mockup
    this.nuevaTarjeta.nombreTarjeta = 'Fernando Velarde';
    this.nuevaTarjeta.numeroTarjeta = '3333 4444 5555 6666';
    this.nuevaTarjeta.mesExpiracion = 9;
    this.nuevaTarjeta.anioExpiracion = 2025;
    this.nuevaTarjeta.cvc = '111';
  }

  getNombreMes(mes: number): string {
    return this.mesesNombres[mes] || mes.toString();
  }
}
