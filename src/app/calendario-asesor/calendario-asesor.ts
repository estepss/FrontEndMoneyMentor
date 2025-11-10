import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Disponibilidad } from '../model/disponibilidad';
import { DisponibilidadService } from '../services/disponibilidad-service';

// Tipo para la celda del calendario
type DiaCalendario = {
  fecha: Date;
  numero: number;
  esHoy: boolean;
  esMesActual: boolean;
  disponibilidades: Disponibilidad[]; // Horarios para este día
};

@Component({
  selector: 'app-calendario-asesor',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './calendario-asesor.html',
  styleUrl: './calendario-asesor.css'
})
export class CalendarioAsesorComponent implements OnInit {

  private disponibilidadService = inject(DisponibilidadService);

  // --- ESTADO DEL CALENDARIO ---
  public fechaActual = new Date();
  public diasDelMes: DiaCalendario[] = [];
  public nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // --- ESTADO DE DISPONIBILIDAD ---
  private idAsesorLogueado = 1; // IMPORTANTE: Debes reemplazar esto con el ID real del asesor logueado
  private disponibilidadesDelMes: Disponibilidad[] = [];
  public horariosDelDiaSeleccionado: Disponibilidad[] = [];
  public diaSeleccionado: DiaCalendario | null = null;
  public horarioSeleccionado: Disponibilidad | null = null;

  // --- ESTADO DE MODALES (Como en los mockups) ---
  public showModalRegistrar = false;
  public showModalEditar = false;

  // --- FORMULARIO DE MODAL ---
  // Opciones de horarios (basado en el mockup)
  public horariosPredefinidos = [
    { texto: '9am-11am', inicio: '09:00', fin: '11:00' },
    { texto: '11am-1pm', inicio: '11:00', fin: '13:00' },
    { texto: '2pm-4pm', inicio: '14:00', fin: '16:00' },
    { texto: '4pm-6pm', inicio: '16:00', fin: '18:00' },
  ];
  public horarioFormulario: { inicio: string, fin: string } = { inicio: '09:00', fin: '11:00' };

  ngOnInit(): void {
    this.generarCalendario();
    this.cargarDisponibilidadesDelAsesor();
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE RENDERIZADO DEL CALENDARIO
  // ------------------------------------------------------------------

  /** Genera los días para la vista del mes actual */
  generarCalendario(): void {
    this.diasDelMes = [];
    const anio = this.fechaActual.getFullYear();
    const mes = this.fechaActual.getMonth(); // 0-11

    const primerDiaDelMes = new Date(anio, mes, 1).getDay(); // 0=Domingo
    const diasEnMes = new Date(anio, mes + 1, 0).getDate(); // Último día del mes

    // Relleno de días del mes anterior
    const diasMesAnterior = new Date(anio, mes, 0).getDate();
    for (let i = primerDiaDelMes; i > 0; i--) {
      const fecha = new Date(anio, mes - 1, diasMesAnterior - i + 1);
      this.diasDelMes.push({
        fecha: fecha,
        numero: fecha.getDate(),
        esHoy: false,
        esMesActual: false,
        disponibilidades: []
      });
    }

    // Días del mes actual
    const hoy = new Date();
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(anio, mes, i);
      const esHoy = fecha.toDateString() === hoy.toDateString();
      this.diasDelMes.push({
        fecha: fecha,
        numero: i,
        esHoy: esHoy,
        esMesActual: true,
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
        disponibilidades: []
      });
    }
  }

  /** Cambia al mes anterior o siguiente */
  cambiarMes(offset: number): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.generarCalendario();
    this.cargarDisponibilidadesDelAsesor(); // Volver a cargar disponibilidades para el nuevo mes
  }

  /** Formatea el título del mes (ej: "Junio 2024") */
  getMesAnio(): string {
    return this.fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE LÓGICA DE DISPONIBILIDAD (CONEXIÓN AL SERVICIO)
  // ------------------------------------------------------------------

  /** Carga todas las disponibilidades del asesor (se podría filtrar por mes) */
  cargarDisponibilidadesDelAsesor(): void {
    this.disponibilidadService.listByAsesor(this.idAsesorLogueado).subscribe(data => {
      this.disponibilidadesDelMes = data;
      // Actualizar el calendario con los datos frescos
      this.generarCalendario();
    });
  }

  /** Filtra las disponibilidades cargadas para un día específico */
  filtrarDisponibilidadPorDia(fecha: Date): Disponibilidad[] {
    const fechaStr = this.formatoFechaISO(fecha); // "YYYY-MM-DD"
    return this.disponibilidadesDelMes
      .filter(d => d.fecha === fechaStr)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)); // Ordenar por hora
  }

  /** Maneja el clic en un día del calendario */
  seleccionarDia(dia: DiaCalendario): void {
    if (!dia.esMesActual) return; // No seleccionar días fuera del mes

    this.diaSeleccionado = dia;
    this.horariosDelDiaSeleccionado = dia.disponibilidades;
    this.horarioSeleccionado = null; // Resetear horario seleccionado
  }

  /** Maneja el clic en un horario de la barra lateral */
  seleccionarHorario(horario: Disponibilidad): void {
    this.horarioSeleccionado = horario;
  }

  /**
   * REGISTRAR: Llama al servicio para guardar la nueva disponibilidad
   */
  registrarDisponibilidad(): void {
    if (!this.diaSeleccionado) return;

    const nuevaDisp = new Disponibilidad();
    nuevaDisp.idAsesor = this.idAsesorLogueado;
    nuevaDisp.fecha = this.formatoFechaISO(this.diaSeleccionado.fecha); // "YYYY-MM-DD"
    nuevaDisp.horaInicio = this.horarioFormulario.inicio; // "HH:mm"
    nuevaDisp.horaFin = this.horarioFormulario.fin;
    nuevaDisp.disponible = true;

    this.disponibilidadService.insert(nuevaDisp).subscribe({
      next: () => {
        this.cargarDisponibilidadesDelAsesor(); // Recargar datos
        this.showModalRegistrar = false;
        // Actualizar la vista lateral
        setTimeout(() => {
          if (this.diaSeleccionado) {
            // Re-seleccionar el día para actualizar la lista
            const diaActualizado = this.diasDelMes.find(d => d.fecha.toDateString() === this.diaSeleccionado?.fecha.toDateString());
            if (diaActualizado) {
              this.seleccionarDia(diaActualizado);
            }
          }
        }, 100); // Pequeña espera para que los datos se refresquen
      },
      error: (err) => console.error("Error al registrar:", err)
    });
  }

  /**
   * EDITAR: Llama al servicio para actualizar la disponibilidad
   */
  actualizarDisponibilidad(): void {
    if (!this.horarioSeleccionado) return;

    // Actualizamos solo las horas (la fecha y el ID no cambian)
    const dispActualizada: Disponibilidad = {
      ...this.horarioSeleccionado,
      horaInicio: this.horarioFormulario.inicio,
      horaFin: this.horarioFormulario.fin,
    };

    this.disponibilidadService.update(dispActualizada).subscribe({
      next: () => {
        this.cargarDisponibilidadesDelAsesor();
        this.showModalEditar = false;
        this.horarioSeleccionado = null;
        // Actualizar vista lateral (similar a registrar)
        setTimeout(() => {
          if (this.diaSeleccionado) {
            const diaActualizado = this.diasDelMes.find(d => d.fecha.toDateString() === this.diaSeleccionado?.fecha.toDateString());
            if (diaActualizado) {
              this.seleccionarDia(diaActualizado);
            }
          }
        }, 100);
      },
      error: (err) => console.error("Error al actualizar:", err)
    });
  }

  /**
   * ELIMINAR: Llama al servicio para borrar la disponibilidad
   */
  eliminarDisponibilidad(): void {
    if (!this.horarioSeleccionado || !this.horarioSeleccionado.idDisponibilidad) return;

    const idParaEliminar = this.horarioSeleccionado.idDisponibilidad;
    this.disponibilidadService.delete(idParaEliminar).subscribe({
      next: () => {
        this.cargarDisponibilidadesDelAsesor();
        this.horarioSeleccionado = null;
        // Actualizar vista lateral (similar a registrar)
        setTimeout(() => {
          if (this.diaSeleccionado) {
            const diaActualizado = this.diasDelMes.find(d => d.fecha.toDateString() === this.diaSeleccionado?.fecha.toDateString());
            if (diaActualizado) {
              this.seleccionarDia(diaActualizado);
            }
          }
        }, 100);
      },
      error: (err) => console.error("Error al eliminar:", err)
    });
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE UTILIDAD Y MODALES
  // ------------------------------------------------------------------

  /** Abre el modal de Registrar (basado en el mockup) */
  abrirModalRegistrar(): void {
    if (!this.diaSeleccionado) {
      // Usamos console.error o un modal custom, no alert()
      console.error("Por favor, seleccione un día del calendario primero.");
      return;
    }
    // Reseteamos el formulario al slot por defecto
    this.horarioFormulario = { inicio: '09:00', fin: '11:00' };
    this.showModalRegistrar = true;
  }

  /** Abre el modal de Editar (basado en el mockup) */
  abrirModalEditar(): void {
    if (!this.horarioSeleccionado) {
      // Usamos console.error o un modal custom, no alert()
      console.error("Por favor, seleccione un horario de la lista primero.");
      return;
    }
    // Cargamos el formulario con los datos del horario seleccionado
    this.horarioFormulario = {
      inicio: this.horarioSeleccionado.horaInicio,
      fin: this.horarioSeleccionado.horaFin
    };
    this.showModalEditar = true;
  }

  /**
   * Función de comparación para el select con ngModel de objetos.
   * Esto asegura que el valor seleccionado en el dropdown se muestre correctamente.
   */
  compararHorarios(o1: { inicio: string, fin: string }, o2: { inicio: string, fin: string }): boolean {
    // Si uno de los objetos es nulo o indefinido, retornar falso (o verdadero si ambos lo son)
    if (!o1 || !o2) return o1 === o2;
    // Comparamos si la hora de inicio Y la hora de fin coinciden.
    return o1.inicio === o2.inicio && o1.fin === o2.fin;
  }


  /** Convierte una hora (ej: "09:00:00") a formato 12h (ej: "9am") */
  formatoHoraAmPm(hora: string): string {
    const [h, m] = hora.split(':');
    const horaNum = parseInt(h, 10);
    const ampm = horaNum >= 12 ? 'pm' : 'am';
    const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
    // Quitamos los minutos si son 00 para mantenerlo limpio (ej: 9am vs 9:30am)
    if (m === '00' || !m) {
      return `${hora12}${ampm}`;
    }
    return `${hora12}:${m}${ampm}`;
  }

  /** Convierte un objeto Date a "YYYY-MM-DD" */
  formatoFechaISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
