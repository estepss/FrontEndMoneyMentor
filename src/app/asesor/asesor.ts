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

interface Reserva {
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  nota?: string;
}

interface ReservaListItem {
  id: number;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  fechas: string[];
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

  mostrarReservaModal = false;
  asesorReserva: Asesor | null = null;


  reservas: Record<number, Reserva[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };


  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  calendarDays: { date: Date; inCurrentMonth: boolean }[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  selectedDate: Date | null = null;
  selectedDateStr = '';
  availableSlots: { label: string; start: string; end: string }[] = [];

  mostrarCardModal = false;
  selectedCard: string | null = null;


  mostrarListaReservas = false;


  reservasList: ReservaListItem[] = [
    {
      id: 1,
      nombre: 'Eleanor Villanueva',
      descripcion:
        'Soy asesora financiera y mi pasión es ayudar a los jóvenes a organizar sus finanzas de manera clara y práctica. Creo que la educación financiera no debería ser complicada ni intimidante, por eso me enfoco en explicar con ejemplos sencillos.',
      imagenUrl: 'https://placehold.co/120x120/faf3d7/0f172a?text=E',
      fechas: [
        '10:00 am - 12:00 pm del 26 de junio de 2024',
        '5:00 pm - 7:00 pm del 26 de junio de 2024',
      ],
    },
    {
      id: 5,
      nombre: 'Roberto Saenz',
      descripcion:
        'Soy asesor financiero especializado en planificación para emprendedores y profesionales independientes. Creo firmemente que una buena educación financiera transforma vidas, por eso me enfoco en acompañar con estrategias claras, realistas y aplicables.',
      imagenUrl: 'https://placehold.co/120x120/f6f9fb/0f172a?text=R',
      fechas: [
        '9:00 am - 10:30 am del 3 de julio de 2024',
        '4:00 pm - 6:00 pm del 5 de julio de 2024',
      ],
    },
  ];

  // ---------------- Reprogramar modal (pequeño) ----------------
  mostrarReprogramar = false;
  reprogramarTarget: ReservaListItem | null = null;
  horarioSeleccionado = '10-12'; // la única opción visual

  constructor() {
    this.buildCalendar(this.currentYear, this.currentMonth);
  }

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

    if (!this.nuevaResena.comentario || this.nuevaResena.comentario.length < 5) {
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
    if (!this.resenas[id]) this.resenas[id] = [];
    this.resenas[id].push(nueva);
    this.nuevaResena = { puntuacion: 0, comentario: '' };
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = 'https://placehold.co/150x150/cccccc/333333?text=Foto';
    }
  }

  // ------------------ CALENDARIO ------------------
  buildCalendar(year: number, month: number) {
    this.calendarDays = [];
    const firstDay = new Date(year, month, 1);
    const startWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startWeek; i++) {
      const dayNum = prevMonthLastDay - startWeek + 1 + i;
      const d = new Date(year, month - 1, dayNum);
      this.calendarDays.push({ date: d, inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      this.calendarDays.push({ date: new Date(year, month, d), inCurrentMonth: true });
    }

    while (this.calendarDays.length % 7 !== 0) {
      const nextIndex = this.calendarDays.length;
      const nextDay = new Date(year, month, daysInMonth + (nextIndex - startWeek) + 1);
      this.calendarDays.push({ date: nextDay, inCurrentMonth: false });
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar(this.currentYear, this.currentMonth);
  }

  goToToday() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.buildCalendar(this.currentYear, this.currentMonth);
    this.selectDay({ date: today, inCurrentMonth: true });
  }

  isToday(day: { date: Date; inCurrentMonth: boolean }) {
    const today = new Date();
    return (
      day.date.getFullYear() === today.getFullYear() &&
      day.date.getMonth() === today.getMonth() &&
      day.date.getDate() === today.getDate()
    );
  }

  isSelected(day: { date: Date; inCurrentMonth: boolean }) {
    if (!this.selectedDate) return false;
    const d = day.date;
    return (
      this.selectedDate.getFullYear() === d.getFullYear() &&
      this.selectedDate.getMonth() === d.getMonth() &&
      this.selectedDate.getDate() === d.getDate()
    );
  }

  get inputMonthYear() {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  // ------------------ RESERVA / CALENDAR ------------------
  abrirReserva(asesor: Asesor | null) {
    if (!asesor) return;
    this.asesorReserva = asesor;
    this.mostrarReservaModal = true;
    this.selectedDate = null;
    this.selectedDateStr = '';
    this.availableSlots = [];
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth();
    this.buildCalendar(this.currentYear, this.currentMonth);
  }

  cerrarReservaModal() {
    this.mostrarReservaModal = false;
    this.asesorReserva = null;
    this.selectedCard = null;
  }

  selectDay(day: { date: Date; inCurrentMonth: boolean }) {
    if (!day.inCurrentMonth) return;
    this.selectedDate = day.date;
    const y = day.date.getFullYear();
    const m = String(day.date.getMonth() + 1).padStart(2, '0');
    const d = String(day.date.getDate()).padStart(2, '0');
    this.selectedDateStr = `${d} - ${this.monthNames[day.date.getMonth()]} - ${y}`;
    // sólo el slot visible que pediste
    this.availableSlots = [{ label: '10 am - 12pm', start: '10:00', end: '12:00' }];
  }

  registrarSlot(slot: { label: string; start: string; end: string }) {
    if (!this.asesorReserva || !this.selectedDate) return;
    const fecha = this.formatDate(this.selectedDate);
    const nueva: Reserva = { fecha, horaInicio: slot.start, horaFin: slot.end };
    const id = this.asesorReserva.id;
    if (!this.reservas[id]) this.reservas[id] = [];

    const collision = this.reservas[id].some(
      (r) =>
        r.fecha === fecha &&
        !(r.horaFin <= nueva.horaInicio || r.horaInicio >= nueva.horaFin)
    );

    if (collision) {
      alert('El slot ya está ocupado para esa fecha.');
      return;
    }

    this.reservas[id].push(nueva);
    this.availableSlots = [];
  }

  formatDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getReservasForAsesor(asesorId?: number) {
    if (!asesorId) return [];
    return this.reservas[asesorId] || [];
  }

  eliminarReserva(asesorId?: number, reserva?: Reserva) {
    if (!asesorId || !reserva) return;
    this.reservas[asesorId] = (this.reservas[asesorId] || []).filter(
      (r) =>
        !(
          r.fecha === reserva.fecha &&
          r.horaInicio === reserva.horaInicio &&
          r.horaFin === reserva.horaFin
        )
    );
  }

  openCardModal(reserva?: Reserva) {
    this.selectedCard = null;
    this.mostrarCardModal = true;
  }

  cerrarCardModal() {
    this.mostrarCardModal = false;
    this.selectedCard = null;
  }

  confirmarPago() {
    if (!this.selectedCard) return;
    alert('Pago realizado con éxito. (Mock)');
    this.cerrarCardModal();
    this.cerrarReservaModal();
  }

  hasAnyReservaForSelectedDate(): boolean {
    if (!this.asesorReserva || !this.selectedDate) return false;
    const fecha = this.formatDate(this.selectedDate);
    const id = this.asesorReserva.id;
    return (this.reservas[id] || []).some(r => r.fecha === fecha);
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }


  abrirListaReservas() {
    this.mostrarListaReservas = true;
  }

  cerrarListaReservas() {
    this.mostrarListaReservas = false;
  }

  abrirReprogramar(item: ReservaListItem) {

    this.reprogramarTarget = item;
    this.horarioSeleccionado = '10-12';
    this.mostrarReprogramar = true;
  }

  cerrarReprogramar() {
    this.reprogramarTarget = null;
    this.mostrarReprogramar = false;
    this.horarioSeleccionado = '10-12';
  }

  registrarReprogramacion() {

    if (!this.reprogramarTarget) return;


    if (this.reprogramarTarget.fechas && this.reprogramarTarget.fechas.length > 0) {

      const original = this.reprogramarTarget.fechas[0];

      let nuevaFechaTexto = '10:00 am - 12:00 pm (reprogramado)';
      try {

        const idx = original.indexOf('del');
        if (idx !== -1) {
          const suf = original.substring(idx);
          nuevaFechaTexto = '10:00 am - 12:00 pm ' + suf;
        } else {

          nuevaFechaTexto = '10:00 am - 12:00 pm (reprogramado)';
        }
      } catch (e) {
        nuevaFechaTexto = '10:00 am - 12:00 pm (reprogramado)';
      }


      this.reprogramarTarget.fechas[0] = nuevaFechaTexto;
    }

    // cerramos modal
    this.cerrarReprogramar();
  }

  eliminarReservaVisual(item: ReservaListItem) {
    this.reservasList = this.reservasList.filter(r => r.id !== item.id);
  }
}
