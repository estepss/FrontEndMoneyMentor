import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
// 1. Importamos ReactiveFormsModule y FormBuilder
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

type DiaCalendario = {
  fecha: Date;
  numero: number;
  esHoy: boolean;
  esMesActual: boolean;
  esPasado: boolean;
  disponibilidades: Disponibilidad[];
};

@Component({
  selector: 'app-calendario-asesor',
  standalone: true,
  // 2. Agregamos ReactiveFormsModule a los imports
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
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
  private fb = inject(FormBuilder); // Inyectamos FormBuilder

  // --- ESTADO DEL CALENDARIO ---
  public fechaActual = new Date();
  public diasDelMes: DiaCalendario[] = [];
  public nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // --- ESTADO DE DISPONIBILIDAD ---
  private idAsesorLogueado: number = 0;
  private disponibilidadesCargadas: Disponibilidad[] = [];
  public horariosDelDiaSeleccionado: Disponibilidad[] = [];
  public diaSeleccionado: DiaCalendario | null = null;
  public horarioSeleccionado: Disponibilidad | null = null;

  // --- ESTADO DE MODALES ---
  public showModalRegistrar = false;
  public showModalEditar = false;
  public errorSolapamiento = false;

  // --- FORMULARIO REACTIVO ---
  public horariosPredefinidos = [
    { texto: '9am-11am', inicio: '09:00', fin: '11:00' },
    { texto: '11am-1pm', inicio: '11:00', fin: '13:00' },
    { texto: '2pm-4pm', inicio: '14:00', fin: '16:00' },
    { texto: '4pm-6pm', inicio: '16:00', fin: '18:00' },
  ];

  // 4. Definimos el FormGroup
  public horarioForm: FormGroup;

  constructor() {
    // Inicializamos el formulario con el primer valor por defecto
    this.horarioForm = this.fb.group({
      horarioSeleccionado: [this.horariosPredefinidos[0], Validators.required]
    });
  }

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

  // --- GETTER HELPER PARA OBTENER VALOR DEL FORM ---
  get formValue() {
    return this.horarioForm.get('horarioSeleccionado')?.value;
  }

  // ------------------------------------------------------------------
  // MÉTODOS DE VALIDACIÓN
  // ------------------------------------------------------------------

  esFechaPasada(fecha: Date): boolean {
    const hoy = new Date();
    const fechaSinHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return fechaSinHora.getTime() < hoySinHora.getTime();
  }

  esHorarioPasado(disponibilidad: Disponibilidad): boolean {
    const [h, m] = disponibilidad.horaFin.split(':').map(Number);
    const fechaFinSlot = new Date(disponibilidad.fecha);
    fechaFinSlot.setHours(h, m, 0, 0);
    const ahora = new Date();
    return fechaFinSlot.getTime() < ahora.getTime();
  }

  esHorarioFormularioPasado(): boolean {
    if (!this.diaSeleccionado || !this.formValue) return true;

    const fechaISO = this.formatoFechaISO(this.diaSeleccionado.fecha);
    const { inicio, fin } = this.formValue; // Usamos el valor del formulario reactivo

    const slotTemporal: Disponibilidad = {
      idDisponibilidad: 0,
      fecha: fechaISO,
      horaInicio: inicio,
      horaFin: fin,
      disponible: true,
      idAsesor: this.idAsesorLogueado
    };

    return this.esHorarioPasado(slotTemporal);
  }

  esMesFuturoLejano(): boolean {
    const unAnioEnElFuturo = new Date();
    unAnioEnElFuturo.setFullYear(unAnioEnElFuturo.getFullYear() + 1);
    return this.fechaActual.getTime() > unAnioEnElFuturo.getTime();
  }

  // ------------------------------------------------------------------
  // VALIDACIÓN DE SOLAPAMIENTO
  // ------------------------------------------------------------------

  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return (h * 60) + m;
  }

  detectarSolapamiento(idExcluir: number | null = null): boolean {
    if(!this.formValue) return false;

    const { inicio, fin } = this.formValue;
    const nuevoInicio = this.horaAMinutos(inicio);
    const nuevoFin = this.horaAMinutos(fin);

    return this.horariosDelDiaSeleccionado.some(existente => {
      if (idExcluir && existente.idDisponibilidad === idExcluir) {
        return false;
      }
      const existInicio = this.horaAMinutos(existente.horaInicio);
      const existFin = this.horaAMinutos(existente.horaFin);
      const hayCruce = (nuevoInicio < existFin) && (existInicio < nuevoFin);
      return hayCruce;
    });
  }

  // ------------------------------------------------------------------
  // RENDERIZADO DEL CALENDARIO
  // ------------------------------------------------------------------

  generarCalendario(): void {
    this.diasDelMes = [];
    const anio = this.fechaActual.getFullYear();
    const mes = this.fechaActual.getMonth();

    const primerDiaDelMes = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(anio, mes, 0).getDate();

    for (let i = primerDiaDelMes; i > 0; i--) {
      const fecha = new Date(anio, mes - 1, diasMesAnterior - i + 1);
      this.diasDelMes.push({
        fecha: fecha,
        numero: fecha.getDate(),
        esHoy: false, esMesActual: false, esPasado: true, disponibilidades: []
      });
    }

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

    const diasMostrados = this.diasDelMes.length;
    const diasSobrantes = (7 - (diasMostrados % 7)) % 7;
    for (let i = 1; i <= diasSobrantes; i++) {
      const fecha = new Date(anio, mes + 1, i);
      this.diasDelMes.push({
        fecha: fecha,
        numero: i,
        esHoy: false, esMesActual: false, esPasado: false, disponibilidades: []
      });
    }
  }

  cambiarMes(offset: number): void {
    if (offset > 0 && this.esMesFuturoLejano()) return;
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.diaSeleccionado = null;
    this.horariosDelDiaSeleccionado = [];
    this.horarioSeleccionado = null;
    this.cargarDisponibilidadesDelAsesor();
  }

  getMesAnio(): string {
    return this.fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  // ------------------------------------------------------------------
  // LOGICA BACKEND
  // ------------------------------------------------------------------

  cargarDisponibilidadesDelAsesor(): void {
    if (this.idAsesorLogueado === 0) return;

    this.disponibilidadService.listByAsesor(this.idAsesorLogueado).subscribe(data => {
      this.disponibilidadesCargadas = data.filter(d => !this.esHorarioPasado(d));
      this.generarCalendario();

      if (this.diaSeleccionado) {
        const diaActualizado = this.diasDelMes.find(d =>
          this.formatoFechaISO(d.fecha) === this.formatoFechaISO(this.diaSeleccionado!.fecha)
        );
        if (diaActualizado) this.seleccionarDia(diaActualizado);
        else {
          this.diaSeleccionado = null;
          this.horariosDelDiaSeleccionado = [];
          this.horarioSeleccionado = null;
        }
      }
    });
  }

  filtrarDisponibilidadPorDia(fecha: Date): Disponibilidad[] {
    const fechaStr = this.formatoFechaISO(fecha);
    return this.disponibilidadesCargadas
      .filter(d => d.fecha === fechaStr)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (!dia.esMesActual || dia.esPasado) {
      if (dia.esPasado) console.warn("No puedes seleccionar un día pasado.");
      this.diaSeleccionado = dia;
      this.horariosDelDiaSeleccionado = [];
      this.horarioSeleccionado = null;
      return;
    }
    this.diaSeleccionado = dia;
    this.horariosDelDiaSeleccionado = dia.disponibilidades;
    this.horarioSeleccionado = null;
  }

  seleccionarHorario(horario: Disponibilidad): void {
    this.horarioSeleccionado = horario;
  }

  registrarDisponibilidad(): void {
    if (!this.diaSeleccionado || !this.formValue) return;

    if (this.esHorarioFormularioPasado()) {
      console.error("Horario pasado.");
      return;
    }

    if (this.detectarSolapamiento()) {
      this.errorSolapamiento = true;
      return;
    } else {
      this.errorSolapamiento = false;
    }

    const { inicio, fin } = this.formValue;

    const nuevaDisp = new Disponibilidad();
    nuevaDisp.idAsesor = this.idAsesorLogueado;
    nuevaDisp.fecha = this.formatoFechaISO(this.diaSeleccionado.fecha);
    nuevaDisp.horaInicio = inicio;
    nuevaDisp.horaFin = fin;
    nuevaDisp.disponible = true;

    this.disponibilidadService.insert(nuevaDisp).subscribe({
      next: () => {
        this.showModalRegistrar = false;
        this.cargarDisponibilidadesDelAsesor();
      },
      error: (err) => console.error("Error al registrar:", err)
    });
  }

  actualizarDisponibilidad(): void {
    if (!this.horarioSeleccionado || !this.formValue) return;

    if (this.esHorarioFormularioPasado()) {
      console.error("Horario pasado.");
      return;
    }

    if (this.detectarSolapamiento(this.horarioSeleccionado.idDisponibilidad)) {
      this.errorSolapamiento = true;
      return;
    } else {
      this.errorSolapamiento = false;
    }

    const { inicio, fin } = this.formValue;

    const dispActualizada: Disponibilidad = {
      ...this.horarioSeleccionado,
      horaInicio: inicio,
      horaFin: fin,
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

  eliminarDisponibilidad(): void {
    if (!this.horarioSeleccionado || !this.horarioSeleccionado.idDisponibilidad) return;
    if (this.diaSeleccionado?.esPasado) return;

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
  // MODALES Y UTILS
  // ------------------------------------------------------------------

  abrirModalRegistrar(): void {
    if (!this.diaSeleccionado || this.diaSeleccionado.esPasado) return;

    // Reseteamos el formulario al primer valor
    this.horarioForm.setValue({
      horarioSeleccionado: this.horariosPredefinidos[0]
    });
    this.errorSolapamiento = false;
    this.showModalRegistrar = true;
  }

  abrirModalEditar(): void {
    if (!this.horarioSeleccionado || this.diaSeleccionado?.esPasado) return;

    // Buscamos el objeto exacto en el array para que el select lo reconozca
    const match = this.horariosPredefinidos.find(h =>
      h.inicio === this.horarioSeleccionado?.horaInicio &&
      h.fin === this.horarioSeleccionado?.horaFin
    );

    this.horarioForm.setValue({
      horarioSeleccionado: match || this.horariosPredefinidos[0]
    });

    this.errorSolapamiento = false;
    this.showModalEditar = true;
  }

  compararHorarios(o1: any, o2: any): boolean {
    if (!o1 || !o2) return o1 === o2;
    return o1.inicio === o2.inicio && o1.fin === o2.fin;
  }

  formatoHoraAmPm(hora: string): string {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    const horaNum = parseInt(h, 10);
    const ampm = horaNum >= 12 ? 'pm' : 'am';
    const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
    if (m === '00' || !m) return `${hora12}${ampm}`;
    return `${hora12}:${m}${ampm}`;
  }

  formatoFechaISO(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
