import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Disponibilidad } from '../../model/disponibilidad';
import { DisponibilidadService } from '../../services/disponibilidad-service';

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
  // Inicializamos a 0 por seguridad, el valor real se lee en ngOnInit.
  private idAsesorLogueado: number = 0;
  private disponibilidadesDelMes: Disponibilidad[] = [];
  public horariosDelDiaSeleccionado: Disponibilidad[] = [];
  public diaSeleccionado: DiaCalendario | null = null;
  public horarioSeleccionado: Disponibilidad | null = null;

  // --- ESTADO DE MODALES ---
  public showModalRegistrar = false;
  public showModalEditar = false;

  // --- FORMULARIO DE MODAL ---
  public horariosPredefinidos = [
    { texto: '9am-11am', inicio: '09:00', fin: '11:00' },
    { texto: '11am-1pm', inicio: '11:00', fin: '13:00' },
    { texto: '2pm-4pm', inicio: '14:00', fin: '16:00' },
    { texto: '4pm-6pm', inicio: '16:00', fin: '18:00' },
  ];
  public horarioFormulario: { inicio: string, fin: string } = { inicio: '09:00', fin: '11:00' };

  ngOnInit(): void {
    // ⬇️ MODIFICACIÓN: Leer 'idAsesor' que es la clave que tu Login.ts usa
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
        disponibilidades: this.filtrarDisponibilidadPorDia(fecha) // Rellenado con datos cargados
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

  /** Carga todas las disponibilidades del asesor (filtradas por el ID logueado) */
  cargarDisponibilidadesDelAsesor(): void {
    if (this.idAsesorLogueado === 0) return;

    this.disponibilidadService.listByAsesor(this.idAsesorLogueado).subscribe(data => {
      this.disponibilidadesDelMes = data;
      this.generarCalendario(); // Re-renderizar el calendario con los datos nuevos

      // Si había un día seleccionado, actualizar su lista de horarios
      if (this.diaSeleccionado) {
        const diaActualizado = this.diasDelMes.find(d => d.fecha.toDateString() === this.diaSeleccionado?.fecha.toDateString());
        if (diaActualizado) {
          this.seleccionarDia(diaActualizado);
        }
      }
    });
  }

  /** Filtra las disponibilidades cargadas para un día específico */
  filtrarDisponibilidadPorDia(fecha: Date): Disponibilidad[] {
    const fechaStr = this.formatoFechaISO(fecha);
    return this.disponibilidadesDelMes
      .filter(d => d.fecha === fechaStr)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  /** Maneja el clic en un día del calendario */
  seleccionarDia(dia: DiaCalendario): void {
    if (!dia.esMesActual) return;

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

    const nuevaDisp = new Disponibilidad();
    nuevaDisp.idAsesor = this.idAsesorLogueado;
    nuevaDisp.fecha = this.formatoFechaISO(this.diaSeleccionado.fecha);
    nuevaDisp.horaInicio = this.horarioFormulario.inicio;
    nuevaDisp.horaFin = this.horarioFormulario.fin;
    nuevaDisp.disponible = true;

    this.disponibilidadService.insert(nuevaDisp).subscribe({
      next: () => {
        this.showModalRegistrar = false;
        this.cargarDisponibilidadesDelAsesor(); // Recargar datos, lo que actualiza automáticamente la vista
      },
      error: (err) => console.error("Error al registrar:", err)
    });
  }

  /** EDITAR: Llama al servicio para actualizar la disponibilidad */
  actualizarDisponibilidad(): void {
    if (!this.horarioSeleccionado) return;

    const dispActualizada: Disponibilidad = {
      ...this.horarioSeleccionado,
      horaInicio: this.horarioFormulario.inicio,
      horaFin: this.horarioFormulario.fin,
    };

    this.disponibilidadService.update(dispActualizada).subscribe({
      next: () => {
        this.showModalEditar = false;
        this.horarioSeleccionado = null;
        this.cargarDisponibilidadesDelAsesor(); // Recargar datos
      },
      error: (err) => console.error("Error al actualizar:", err)
    });
  }

  /** ELIMINAR: Llama al servicio para borrar la disponibilidad */
  eliminarDisponibilidad(): void {
    if (!this.horarioSeleccionado || !this.horarioSeleccionado.idDisponibilidad) return;

    const idParaEliminar = this.horarioSeleccionado.idDisponibilidad;
    this.disponibilidadService.delete(idParaEliminar).subscribe({
      next: () => {
        this.horarioSeleccionado = null;
        this.cargarDisponibilidadesDelAsesor(); // Recargar datos
      },
      error: (err) => console.error("Error al eliminar:", err)
    });
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE UTILIDAD Y MODALES
  // ------------------------------------------------------------------

  /** Abre el modal de Registrar */
  abrirModalRegistrar(): void {
    if (!this.diaSeleccionado) {
      console.error("Por favor, seleccione un día del calendario primero.");
      return;
    }
    // Reseteamos el formulario al slot por defecto
    this.horarioFormulario = { inicio: '09:00', fin: '11:00' };
    this.showModalRegistrar = true;
  }

  /** Abre el modal de Editar */
  abrirModalEditar(): void {
    if (!this.horarioSeleccionado) {
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
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
  }
}
