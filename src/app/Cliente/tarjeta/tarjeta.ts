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
  // Generamos los años desde el actual hasta +5 años
  anios: number[] = this.generarAniosExpiracion();
  mesesNombres: { [key: number]: string } = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
    7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
  };

  constructor() {
    this.resetearFormulario();
  }

  ngOnInit(): void {
    const storedId = localStorage.getItem('idCliente');

    if (storedId) {
      this.idClienteLogueado = parseInt(storedId, 10);
      console.log(`TarjetaComponent inicializado para Cliente ID: ${this.idClienteLogueado}`);

      this.cargarTarjetas();
    } else {
      console.error("¡Error! No se encontró el ID del usuario en localStorage. ¿El usuario inició sesión?");
    }
  }

  // =========================================================================
  // ⭐️ LÓGICA DE VALIDACIÓN (Implementación de reglas del TarjetaDTO) ⭐️
  // =========================================================================

  /**
   * Valida la nueva tarjeta según las reglas del backend (TarjetaDTO).
   * @returns {string | null} El mensaje de error si la validación falla, o null si es exitosa.
   */
  validarTarjeta(): string | null {
    const tarjeta = this.nuevaTarjeta;
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;

    // 1. nombreTarjeta (@NotBlank)
    if (!tarjeta.nombreTarjeta || tarjeta.nombreTarjeta.trim() === '') {
      return "El nombre del titular no puede estar vacío.";
    }

    // 2. numeroTarjeta (@NotBlank, @Pattern: \d{13,19})
    // Se limpia de espacios antes de validar
    const numeroLimpio = tarjeta.numeroTarjeta.replace(/\s/g, '');
    if (!numeroLimpio || numeroLimpio === '') {
      return "El número de tarjeta no puede estar vacío.";
    }
    if (!/^\d{13,19}$/.test(numeroLimpio)) {
      return "El número de tarjeta debe tener entre 13 y 19 dígitos.";
    }

    // 3. cvc (@NotBlank, @Pattern: \d{3,4})
    if (!tarjeta.cvc || tarjeta.cvc.trim() === '') {
      return "El CVC no puede estar vacío.";
    }
    if (!/^\d{3,4}$/.test(tarjeta.cvc.trim())) {
      return "El CVC debe tener 3 o 4 dígitos.";
    }

    // 4. anioExpiracion (@Min(2025)) -> Adaptado a la lógica del frontend (>= año actual o siguiente)
    if (tarjeta.anioExpiracion < anioActual) {
      return "El año de expiración no puede ser pasado.";
    }

    // 5. mesExpiracion (@Min(1), @Max(12)) -> Esto lo controla el <select>
    if (tarjeta.mesExpiracion < 1 || tarjeta.mesExpiracion > 12) {
      return "Seleccione un mes de expiración válido.";
    }

    // 6. Validación de fecha: No puede expirar este mes o en el pasado
    if (tarjeta.anioExpiracion === anioActual && tarjeta.mesExpiracion < mesActual) {
      return "La fecha de expiración no puede ser anterior al mes actual.";
    }

    // Si todo es correcto, retorna null
    return null;
  }

  // =========================================================================
  // LÓGICA CRUD
  // =========================================================================

  /**
   * Carga las tarjetas EXCLUSIVAMENTE del cliente logueado.
   */
  cargarTarjetas(): void {
    if (this.idClienteLogueado === 0) return;

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
    if (this.idClienteLogueado === 0) {
      console.error('No se puede guardar la tarjeta: Usuario no identificado.');
      alert('Error de sesión. Por favor, inicie sesión nuevamente.');
      return;
    }

    // ⭐️ PASO CLAVE: VALIDAR ANTES DE CONTINUAR
    const errorValidacion = this.validarTarjeta();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    // Limpieza final de datos (quitar espacios en blanco del número)
    this.nuevaTarjeta.numeroTarjeta = this.nuevaTarjeta.numeroTarjeta.replace(/\s/g, '');

    // 2. ASIGNAR EL ID DEL CLIENTE A LA TARJETA ANTES DE ENVIAR
    this.nuevaTarjeta.idCliente = this.idClienteLogueado;

    // Llamada al servicio
    this.tarjetaService.insert(this.nuevaTarjeta).subscribe({
      next: (tarjetaGuardada) => {
        console.log('Tarjeta guardada exitosamente:', tarjetaGuardada);
        alert('Tarjeta agregada correctamente');

        this.cargarTarjetas();
        this.vistaActual = 'lista';
        this.resetearFormulario();
      },
      error: (err) => {
        console.error('Error al guardar la tarjeta:', err.error.message || err);
        alert(`Error al guardar: ${err.error.message || 'Intente nuevamente.'}`);
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
    this.cargarTarjetas();
  }

  mostrarAgregar(): void {
    this.vistaActual = 'agregar';
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.nuevaTarjeta = new Tarjeta();

    if (this.idClienteLogueado !== 0) {
      this.nuevaTarjeta.idCliente = this.idClienteLogueado;
    }

    // Valores por defecto al mes/año actual para que no quede 0/0
    this.nuevaTarjeta.mesExpiracion = new Date().getMonth() + 1;
    this.nuevaTarjeta.anioExpiracion = new Date().getFullYear();
    this.nuevaTarjeta.cvc = '';
  }

  getNombreMes(mes: number): string {
    return this.mesesNombres[mes] || mes.toString();
  }

  generarAniosExpiracion(): number[] {
    const anioActual = new Date().getFullYear();
    const anios = [];
    // Generar años desde el actual hasta el próximo 5 años (2024 a 2028 o similar)
    for (let i = 0; i <= 5; i++) {
      anios.push(anioActual + i);
    }
    return anios;
  }
}
