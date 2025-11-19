import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Importamos el Modelo y Servicio actualizados
import {Tarjeta} from '../../model/tarjeta';
import {TarjetaService} from '../../services/tarjeta-service';

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './tarjeta.html', // Asegúrate de que el nombre del archivo HTML sea correcto
  styleUrl: './tarjeta.css'      // Asegúrate de que el nombre del archivo CSS sea correcto
})
export class TarjetaComponent implements OnInit {

  private tarjetaService = inject(TarjetaService);

  // Variables de estado
  nuevaTarjeta: Tarjeta = new Tarjeta();
  tarjetasAgregadas: Tarjeta[] = [];
  vistaActual: 'agregar' | 'lista' = 'agregar';

  // ⬇️ Variable para almacenar el ID del cliente logueado
  idClienteLogueado: number = 0;

  // Datos para los selects de fecha
  meses: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  anios: number[] = [2024, 2025, 2026, 2027, 2028];
  mesesNombres: { [key: number]: string } = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
  };

  constructor() {
    // Inicializamos el formulario con valores por defecto o vacíos
    this.resetearFormulario();
  }

  ngOnInit(): void {
    // 1. OBTENER ID DEL CLIENTE LOGUEADO AL INICIAR
    // Buscamos en localStorage la clave 'userId' o 'idCliente' (según cómo lo guardaste en el Login)
    // En tu Login.ts vi que usas 'userId' y 'idCliente'. Usaremos 'userId' como el ID principal.
    const storedId = localStorage.getItem('userId');

    if (storedId) {
      this.idClienteLogueado = parseInt(storedId, 10);
      console.log(`TarjetaComponent inicializado para Cliente ID: ${this.idClienteLogueado}`);

      // Una vez tenemos el ID, cargamos SUS tarjetas
      this.cargarTarjetas();
    } else {
      console.error("¡Error! No se encontró el ID del usuario en localStorage. ¿El usuario inició sesión?");
      // Aquí podrías redirigir al login si es crítico: this.router.navigate(['/login']);
    }
  }

  /**
   * Carga las tarjetas EXCLUSIVAMENTE del cliente logueado.
   */
  cargarTarjetas(): void {
    if (this.idClienteLogueado === 0) return;

    // Llamamos al nuevo método del servicio que filtra por ID en el backend
    this.tarjetaService.listPorCliente(this.idClienteLogueado).subscribe({
      next: (tarjetas) => {
        this.tarjetasAgregadas = tarjetas;
        console.log('Mis tarjetas cargadas:', tarjetas);
      },
      error: (err) => {
        console.error('Error al cargar la lista de tarjetas:', err);
      }
    });
  }

  /**
   * Guarda una nueva tarjeta asignada al cliente logueado.
   */
  agregarTarjeta(): void {
    // Validaciones básicas
    if (!this.nuevaTarjeta.nombreTarjeta || !this.nuevaTarjeta.numeroTarjeta) {
      console.error('Por favor, complete los campos obligatorios.');
      alert('Por favor, complete el nombre y el número de tarjeta.');
      return;
    }

    if (this.idClienteLogueado === 0) {
      console.error('No se puede guardar la tarjeta: Usuario no identificado.');
      alert('Error de sesión. Por favor, inicie sesión nuevamente.');
      return;
    }

    // Limpieza de datos (quitar espacios en blanco del número)
    this.nuevaTarjeta.numeroTarjeta = this.nuevaTarjeta.numeroTarjeta.replace(/\s/g, '');

    // 2. ASIGNAR EL ID DEL CLIENTE A LA TARJETA ANTES DE ENVIAR
    this.nuevaTarjeta.idCliente = this.idClienteLogueado;

    // Llamada al servicio
    this.tarjetaService.insert(this.nuevaTarjeta).subscribe({
      next: (tarjetaGuardada) => {
        console.log('Tarjeta guardada exitosamente:', tarjetaGuardada);
        alert('Tarjeta agregada correctamente');

        // Recargar la lista para ver la nueva tarjeta
        this.cargarTarjetas();

        // Cambiar a la vista de lista
        this.vistaActual = 'lista';

        // Limpiar el formulario para la próxima vez
        this.resetearFormulario();
      },
      error: (err) => {
        console.error('Error al guardar la tarjeta:', err);
        alert('Hubo un error al guardar la tarjeta. Intente nuevamente.');
      }
    });
  }

  /**
   * Elimina una tarjeta de la base de datos.
   */
  eliminarTarjeta(index: number): void {
    const tarjetaAEliminar = this.tarjetasAgregadas[index];

    if (!tarjetaAEliminar.idTarjeta) {
      console.error("Error: La tarjeta no tiene ID válido.");
      return;
    }

    if(confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
      this.tarjetaService.delete(tarjetaAEliminar.idTarjeta).subscribe({
        next: () => {
          console.log(`Tarjeta ${tarjetaAEliminar.idTarjeta} eliminada.`);
          // Si la eliminación en BD es exitosa, actualizamos la lista local
          this.tarjetasAgregadas.splice(index, 1);
        },
        error: (err) => {
          console.error(`Error al eliminar la tarjeta:`, err);
          alert('No se pudo eliminar la tarjeta.');
        }
      });
    }
  }

  // --- Métodos de Navegación y Utilidad ---

  mostrarLista(): void {
    this.vistaActual = 'lista';
    // Recargamos para asegurar que la lista esté actualizada
    this.cargarTarjetas();
  }

  mostrarAgregar(): void {
    this.vistaActual = 'agregar';
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.nuevaTarjeta = new Tarjeta();
    // Aseguramos que el ID del cliente se mantenga si ya lo tenemos
    if (this.idClienteLogueado !== 0) {
      this.nuevaTarjeta.idCliente = this.idClienteLogueado;
    }

    // Valores por defecto para facilitar pruebas (puedes quitarlos en producción)
    this.nuevaTarjeta.nombreTarjeta = '';
    this.nuevaTarjeta.numeroTarjeta = '';
    this.nuevaTarjeta.mesExpiracion = new Date().getMonth() + 1;
    this.nuevaTarjeta.anioExpiracion = new Date().getFullYear();
    this.nuevaTarjeta.cvc = '';
  }

  getNombreMes(mes: number): string {
    return this.mesesNombres[mes] || mes.toString();
  }
}
