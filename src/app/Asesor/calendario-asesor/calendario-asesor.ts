import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Disponibilidad } from '../../model/disponibilidad';
import { DisponibilidadService } from '../../services/disponibilidad-service';
import {
  trigger,
  transition,
  query,
  stagger,
  animate,
  style
} from '@angular/animations';

// Tipo para la celda del calendario, incluyendo el estado esPasado
type DiaCalendario = {
  fecha: Date;
  numero: number;
  esHoy: boolean;
  esMesActual: boolean;
  esPasado: boolean; // Indica si la fecha completa ya pasó
  disponibilidades: Disponibilidad[]; // Horarios para este día
};

@Component({
  selector: 'app-calendario-asesor',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './calendario-asesor.html',
  styleUrl: './calendario-asesor.css',
  animations: [
    trigger('diasAnim', [
      transition(':enter', [
        query('.dia-celda', [
          style({ opacity: 0, transform: 'scale(0.9)' }),
          stagger(30, [
            animate(
              '200ms ease-out',
              style({ opacity: 1, transform: 'scale(1)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class CalendarioAsesorComponent implements OnInit {

  private disponibilidadService = inject(DisponibilidadService);

  // --- ESTADO DEL CALENDARIO ---
  public fechaActual = new Date();
  public diasDelMes: DiaCalendario[] = [];
  public nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // --- ESTADO DE DISPONIBILIDAD ---
  private idAsesorLogueado: number = 0;
  // Almacena TODAS las disponibilidades cargadas del backend
  private disponibilidadesCargadas: Disponibilidad[] = [];
  // Horarios SOLO FUTUROS/ACTUALES que se muestran en el sidebar
  public horariosDelDiaSeleccionado: Disponibilidad[] = [];
  public diaSeleccionado: DiaCalendario | null = null;
  public horarioSeleccionado: Disponibilidad | null = null;

  // --- ESTADO DE MODALES ---
  public showModalRegistrar = false;
  public showModalEditar = false;

  // Variable para controlar mensaje de error de solapamiento
  public errorSolapamiento = false;

  // --- FORMULARIO DE MODAL ---
  public horariosPredefinidos = [
    { texto: '9am-11am', inicio: '09:00', fin: '11:00' },
    { texto: '11am-1pm', inicio: '11:00', fin: '13:00' },
    { texto: '2pm-4pm', inicio: '14:00', fin: '16:00' },
    { texto: '4pm-6pm', inicio: '16:00', fin: '18:00' },
  ];
  public horarioFormulario: { inicio: string, fin: string } = { inicio: '09:00', fin: '11:00' };

  ngOnInit(): void {
    const storedId = localStorage.getItem('idAsesor');

    if (storedId) {
      this.idAsesorLogueado = parseInt(storedId, 10);
      console.log(`Calendario cargado para Asesor ID: ${this.idAsesorLogueado}`);
    } else {
      console.error("¡Error Crítico! No se encontró el ID del asesor ('idAsesor') en localStorage.");
      return;
    }

    this.generarCalendario();
    this.cargarDisponibilidadesDelAsesor();
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE VALIDACIÓN DE FECHA/HORA
  // ------------------------------------------------------------------

  /**
   * Comprueba si la fecha completa ya ha pasado (sin considerar la hora).
   */
  esFechaPasada(fecha: Date): boolean {
    const hoy = new Date();
    // Normalizamos para comparar solo fecha (YYYY-MM-DD)
    const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    return fechaSinHora.getTime() < hoySinHora.getTime();
  }

  /**
   * Comprueba si un slot de disponibilidad (fecha + horaFin) ya ha pasado.
   */
  esHorarioPasado(disponibilidad: Disponibilidad): boolean {
    const [h, m] = disponibilidad.horaFin.split(':').map(Number);
    const fechaFinSlot = new Date(disponibilidad.fecha);
    fechaFinSlot.setHours(h, m, 0, 0);

    const ahora = new Date();
    return fechaFinSlot.getTime() < ahora.getTime();
  }

  /**
   * Comprueba si el horario seleccionado en el modal ya pasó para el día seleccionado.
   */
  esHorarioFormularioPasado(): boolean {
    if (!this.diaSeleccionado) return true;

    const fechaISO = this.formatoFechaISO(this.diaSeleccionado.fecha);

    const slotTemporal: Disponibilidad = {
      idDisponibilidad: 0,
      fecha: fechaISO,
      horaInicio: this.horarioFormulario.inicio,
      horaFin: this.horarioFormulario.fin,
      disponible: true,
      idAsesor: this.idAsesorLogueado
    };

    return this.esHorarioPasado(slotTemporal);
  }

  /**
   * Permite navegar solo hasta un año en el futuro.
   */
  esMesFuturoLejano(): boolean {
    const unAnioEnElFuturo = new Date();
    unAnioEnElFuturo.setFullYear(unAnioEnElFuturo.getFullYear() + 1);
    return this.fechaActual.getTime() > unAnioEnElFuturo.getTime();
  }

  // ------------------------------------------------------------------
  //  NUEVA LÓGICA DE VALIDACIÓN DE SOLAPAMIENTO (RANGO DE HORAS)
  // ------------------------------------------------------------------

  /**
   * Convierte una hora string "HH:mm" a minutos totales (ej: "01:30" -> 90)
   */
  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return (h * 60) + m;
  }

  /**
   * Verifica si el horario seleccionado en el formulario se cruza con alguno existente.
   * @param idExcluir (Opcional) ID de la disponibilidad que estamos editando.
   */
  detectarSolapamiento(idExcluir: number | null = null): boolean {
    // 1. Convertimos el nuevo rango a minutos
    const nuevoInicio = this.horaAMinutos(this.horarioFormulario.inicio);
    const nuevoFin = this.horaAMinutos(this.horarioFormulario.fin);

    // 2. Recorremos los horarios que YA existen en el día seleccionado
    return this.horariosDelDiaSeleccionado.some(existente => {

      // Si estamos editando, ignoramos el mismo registro que estamos modificando
      if (idExcluir && existente.idDisponibilidad === idExcluir) {
        return false;
      }

      // Convertimos el rango existente a minutos
      const existInicio = this.horaAMinutos(existente.horaInicio);
      const existFin = this.horaAMinutos(existente.horaFin);

      // 3. FÓRMULA DE SOLAPAMIENTO: (InicioA < FinB) Y (InicioB < FinA)
      const hayCruce = (nuevoInicio < existFin) && (existInicio < nuevoFin);

      return hayCruce;
    });
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE RENDERIZADO DEL CALENDARIO
  // ------------------------------------------------------------------

  /** Genera los días para la vista del mes actual */
  generarCalendario(): void {
    this.diasDelMes = [];
    const anio = this.fechaActual.getFullYear();
    const mes = this.fechaActual.getMonth();

    const primerDiaDelMes = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    // Relleno de días del mes anterior
    const diasMesAnterior = new Date(anio, mes, 0).getDate();
    for (let i = primerDiaDelMes; i > 0; i--) {
      const fecha = new Date(anio, mes - 1, diasMesAnterior - i + 1);
      this.diasDelMes.push({
        fecha: fecha,
        numero: fecha.getDate(),
        esHoy: false,
        esMesActual: false,
        esPasado: true,
        disponibilidades: []
      });
    }

    // Días del mes actual
    const hoy = new Date();
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(anio, mes, i);
      const esHoy = fecha.toDateString() === hoy.toDateString();
      const esPasado = this.esFechaPasada(fecha);

      this.diasDelMes.push({
        fecha: fecha,
        numero: i,
        esHoy: esHoy,
        esMesActual: true,
        esPasado: esPasado,
        disponibilidades: this.filtrarDisponibilidadPorDia(fecha)
      });
    }

    // Relleno de días del mes siguiente
    const diasMostrados = this.diasDelMes.length;
    const diasSobrantes = (7 - (diasMostrados % 7)) % 7;
    for (let i = 1; i <= diasSobrantes; i++) {
      const fecha = new Date(anio, mes + 1, i);
      this.diasDelMes.push({
        fecha: fecha,
        numero: i,
        esHoy: false,
        esMesActual: false,
        esPasado: false,
        disponibilidades: []
      });
    }
  }

  /** Cambia al mes anterior o siguiente */
  cambiarMes(offset: number): void {
    if (offset > 0 && this.esMesFuturoLejano()) {
      return;
    }
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.diaSeleccionado = null;
    this.horariosDelDiaSeleccionado = [];
    this.horarioSeleccionado = null;
    this.cargarDisponibilidadesDelAsesor();
  }

  /** Formatea el título del mes (ej: "Junio 2024") */
  getMesAnio(): string {
    return this.fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE LÓGICA DE DISPONIBILIDAD (CONEXIÓN AL SERVICIO)
  // ------------------------------------------------------------------

  /** Carga todas las disponibilidades del asesor y filtra las pasadas. */
  cargarDisponibilidadesDelAsesor(): void {
    if (this.idAsesorLogueado === 0) return;

    this.disponibilidadService.listByAsesor(this.idAsesorLogueado).subscribe(data => {
      this.disponibilidadesCargadas = data.filter(d => !this.esHorarioPasado(d));
      this.generarCalendario();

      if (this.diaSeleccionado) {
        const diaActualizado = this.diasDelMes.find(d =>
          this.formatoFechaISO(d.fecha) === this.formatoFechaISO(this.diaSeleccionado!.fecha)
        );
        if (diaActualizado) {
          this.seleccionarDia(diaActualizado);
        } else {
          this.diaSeleccionado = null;
          this.horariosDelDiaSeleccionado = [];
          this.horarioSeleccionado = null;
        }
      }
    });
  }

  /** Filtra las disponibilidades cargadas (solo futuras) para un día específico */
  filtrarDisponibilidadPorDia(fecha: Date): Disponibilidad[] {
    const fechaStr = this.formatoFechaISO(fecha);
    return this.disponibilidadesCargadas
      .filter(d => d.fecha === fechaStr)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  /** Maneja el clic en un día del calendario */
  seleccionarDia(dia: DiaCalendario): void {
    if (!dia.esMesActual || dia.esPasado) {
      if (dia.esPasado) {
        console.warn("No puedes seleccionar un día pasado para gestionar horarios.");
      }
      this.diaSeleccionado = dia;
      this.horariosDelDiaSeleccionado = [];
      this.horarioSeleccionado = null;
      return;
    }
    this.diaSeleccionado = dia;
    this.horariosDelDiaSeleccionado = dia.disponibilidades;
    this.horarioSeleccionado = null;
  }

  /** Maneja el clic en un horario de la barra lateral */
  seleccionarHorario(horario: Disponibilidad): void {
    this.horarioSeleccionado = horario;
  }

  /** REGISTRAR: Llama al servicio para guardar la nueva disponibilidad */
  registrarDisponibilidad(): void {
    if (!this.diaSeleccionado) return;
    if (this.esHorarioFormularioPasado()) {
      console.error("No se puede registrar un horario cuya hora de fin ya ha pasado.");
      return;
    }

    // --- VALIDACIÓN DE SOLAPAMIENTO ---
    if (this.detectarSolapamiento()) {
      this.errorSolapamiento = true; // Mostramos error
      return; // Detenemos el guardado
    } else {
      this.errorSolapamiento = false;
    }

    const nuevaDisp = new Disponibilidad();
    nuevaDisp.idAsesor = this.idAsesorLogueado;
    nuevaDisp.fecha = this.formatoFechaISO(this.diaSeleccionado.fecha);
    nuevaDisp.horaInicio = this.horarioFormulario.inicio;
    nuevaDisp.horaFin = this.horarioFormulario.fin;
    nuevaDisp.disponible = true;

    this.disponibilidadService.insert(nuevaDisp).subscribe({
      next: () => {
        this.showModalRegistrar = false;
        this.cargarDisponibilidadesDelAsesor();
      },
      error: (err) => console.error("Error al registrar:", err)
    });
  }

  /** EDITAR: Llama al servicio para actualizar la disponibilidad */
  actualizarDisponibilidad(): void {
    if (!this.horarioSeleccionado) return;
    if (this.esHorarioFormularioPasado()) {
      console.error("No se puede actualizar a un horario cuya hora de fin ya ha pasado.");
      return;
    }

    // --- VALIDACIÓN DE SOLAPAMIENTO ---
    // Pasamos el ID actual para no chocar con el registro que estamos editando
    if (this.detectarSolapamiento(this.horarioSeleccionado.idDisponibilidad)) {
      this.errorSolapamiento = true; // Mostramos error
      return; // Detenemos la edición
    } else {
      this.errorSolapamiento = false;
    }

    const dispActualizada: Disponibilidad = {
      ...this.horarioSeleccionado,
      horaInicio: this.horarioFormulario.inicio,
      horaFin: this.horarioFormulario.fin,
    };

    this.disponibilidadService.update(dispActualizada).subscribe({
      next: () => {
        this.showModalEditar = false;
        this.horarioSeleccionado = null;
        this.cargarDisponibilidadesDelAsesor();
      },
      error: (err) => console.error("Error al actualizar:", err)
    });
  }

  /** ELIMINAR: Llama al servicio para borrar la disponibilidad */
  eliminarDisponibilidad(): void {
    if (!this.horarioSeleccionado || !this.horarioSeleccionado.idDisponibilidad) return;
    if (this.diaSeleccionado?.esPasado) {
      console.error("No se puede eliminar un horario en un día pasado.");
      return;
    }

    const idParaEliminar = this.horarioSeleccionado.idDisponibilidad;
    this.disponibilidadService.delete(idParaEliminar).subscribe({
      next: () => {
        this.horarioSeleccionado = null;
        this.cargarDisponibilidadesDelAsesor();
      },
      error: (err) => console.error("Error al eliminar:", err)
    });
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE UTILIDAD Y MODALES
  // ------------------------------------------------------------------

  /** Abre el modal de Registrar */
  abrirModalRegistrar(): void {
    if (!this.diaSeleccionado || this.diaSeleccionado.esPasado) {
      console.error("Por favor, seleccione un día actual o futuro del calendario primero.");
      return;
    }
    this.horarioFormulario = { inicio: '09:00', fin: '11:00' };
    this.errorSolapamiento = false; // Resetear error
    this.showModalRegistrar = true;
  }

  /** Abre el modal de Editar */
  abrirModalEditar(): void {
    if (!this.horarioSeleccionado || this.diaSeleccionado?.esPasado) {
      console.error("Por favor, seleccione un horario de la lista primero, y asegúrese de que el día no es pasado.");
      return;
    }
    this.horarioFormulario = {
      inicio: this.horarioSeleccionado.horaInicio,
      fin: this.horarioSeleccionado.horaFin
    };
    this.errorSolapamiento = false; // Resetear error
    this.showModalEditar = true;
  }

  /** Función de comparación para el select de horarios */
  compararHorarios(o1: { inicio: string, fin: string }, o2: { inicio: string, fin: string }): boolean {
    if (!o1 || !o2) return o1 === o2;
    return o1.inicio === o2.inicio && o1.fin === o2.fin;
  }

  /** Convierte una hora (ej: "09:00:00") a formato 12h (ej: "9am") */
  formatoHoraAmPm(hora: string): string {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    const horaNum = parseInt(h, 10);
    const ampm = horaNum >= 12 ? 'pm' : 'am';
    const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
    if (m === '00' || !m) {
      return `${hora12}${ampm}`;
    }
    return `${hora12}:${m}${ampm}`;
  }

  /** Convierte un objeto Date a "YYYY-MM-DD" */
  formatoFechaISO(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
