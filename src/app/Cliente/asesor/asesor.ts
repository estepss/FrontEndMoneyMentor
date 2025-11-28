import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AsesorFinanciero } from '../../model/asesor-financiero';
import { Disponibilidad } from '../../model/disponibilidad';
import { CalificacionAsesor } from '../../model/calificacion-asesor';
import { Tarjeta } from '../../model/tarjeta';
import { Reserva } from '../../model/reserva';

import { AsesorService } from '../../services/asesor-service';
import { DisponibilidadService } from '../../services/disponibilidad-service';
import { CalificacionService } from '../../services/calificacion-asesor-service';
import { ReservaService } from '../../services/reserva-service';
import { TarjetaService } from '../../services/tarjeta-service';

@Component({
  selector: 'app-asesor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './asesor.html',
  styleUrls: ['./asesor.css'],
})
export class AsesorComponent implements OnInit {

  private asesorService = inject(AsesorService);
  private disponibilidadService = inject(DisponibilidadService);
  private calificacionService = inject(CalificacionService);
  private reservaService = inject(ReservaService);
  private tarjetaService = inject(TarjetaService);
  private fb = inject(FormBuilder);

  public asesores: AsesorFinanciero[] = [];
  public disponibilidades: Record<number, Disponibilidad[]> = {};


  public resenaForm: FormGroup;
  public reservaForm: FormGroup;
  public reprogramForm: FormGroup;


  public mostrarReservaModal = false;
  public asesorReserva: AsesorFinanciero | null = null;
  public horariosVisibles: Disponibilidad[] = [];
  public slotSeleccionado: Disponibilidad | null = null;

  public modalidadSeleccionada = 'Virtual';
  public tarjetas: Tarjeta[] = [];
  public tarjetaSeleccionada: Tarjeta | null = null;
  public precioCalculado = 0;

  // =========================================================
  // RESEÑAS
  // =========================================================
  public mostrarResenaModal = false;
  public asesorSeleccionado: AsesorFinanciero | null = null;
  public resenas: Record<number, CalificacionAsesor[]> = {};


  public mostrarModalReservas = false;
  public reservasCliente: Reserva[] = [];

  // Reprogramación
  public mostrarModalReprogramar = false;
  public reservaAReprogramar: Reserva | null = null;
  public horariosDisponiblesReprogramacion: Disponibilidad[] = [];
  public nuevoHorarioSeleccionado: Disponibilidad | null = null;

  constructor() {
    // Inicializar formularios
    this.resenaForm = this.fb.group({
      puntuacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.reservaForm = this.fb.group({
      tarjeta: [null, Validators.required],
      modalidad: ['Virtual']

    });

    this.reprogramForm = this.fb.group({
      nuevoHorario: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarAsesores();
  }


  cargarAsesores(): void {
    this.asesorService.obtenerTodosLosAsesores().subscribe({
      next: (data) => {
        this.asesores = data;
        data.forEach((asesor) => {
          this.cargarDisponibilidad(asesor.idAsesor);
          this.cargarResenas(asesor.idAsesor);
        });
      },
      error: (err) => console.error(err),
    });
  }

  cargarDisponibilidad(idAsesor: number): void {
    this.disponibilidadService.listByAsesor(idAsesor).subscribe({
      next: (data) => {
        this.disponibilidades[idAsesor] = data.filter(s => s.disponible);
      },
      error: () => (this.disponibilidades[idAsesor] = []),
    });
  }

  cargarResenas(idAsesor: number): void {
    this.calificacionService.listarPorAsesor(idAsesor).subscribe({
      next: (data) => this.resenas[idAsesor] = data,
      error: (err) => console.error(err),
    });
  }

  cargarTarjetas(): void {
    const idCliente = Number(localStorage.getItem('idCliente'));
    if (idCliente) {
      this.tarjetaService.listPorCliente(idCliente).subscribe({
        next: (data) => this.tarjetas = data,
        error: (err) => {
          console.error("Error al cargar tarjetas del cliente:", err);
          this.tarjetas = [];
        }
      });
    } else {
      console.warn("No se encontró idCliente en localStorage. No se cargan tarjetas.");
      this.tarjetas = [];
    }
  }


  abrirModalResena(asesor: AsesorFinanciero): void {
    this.asesorSeleccionado = asesor;
    this.resenaForm.reset({ puntuacion: null, comentario: '' });
    this.mostrarResenaModal = true;
  }

  cerrarModalResena(): void {
    this.mostrarResenaModal = false;
    this.asesorSeleccionado = null;
    this.resenaForm.reset();
  }

  enviarResena(): void {
    if (!this.asesorSeleccionado) return;
    if (this.resenaForm.invalid) {
      alert('La reseña no cumple las validaciones (puntuación 1–5, comentario mínimo 5 carácteres).');
      return;
    }

    const idCliente = Number(localStorage.getItem('idCliente'));
    const dto = {
      puntuacion: this.resenaForm.value.puntuacion,
      comentario: this.resenaForm.value.comentario,
      idAsesor: this.asesorSeleccionado.idAsesor,
      idCliente: idCliente
    };

    this.calificacionService.insertar(dto).subscribe({
      next: () => {
        this.cargarResenas(this.asesorSeleccionado!.idAsesor);
        this.cerrarModalResena();
      },
      error: () => alert('Error al registrar la reseña')
    });
  }


  abrirReserva(asesor: AsesorFinanciero): void {
    this.cargarTarjetas();
    this.asesorReserva = asesor;

    const hoy = new Date();

    this.horariosVisibles = (this.disponibilidades[asesor.idAsesor] || [])
      .filter(slot => {
        if (!slot.fecha || !slot.horaInicio) return false;
        const slotDateTime = new Date(`${slot.fecha}T${slot.horaInicio}`);
        if (slotDateTime < hoy) return false;

        const slotDateOnly = new Date(slot.fecha);
        const todayDateOnly = new Date(hoy.toISOString().split("T")[0]);
        if (slotDateOnly.getTime() === todayDateOnly.getTime()) {
          const [h, m] = slot.horaInicio.split(':').map(Number);
          if (h < hoy.getHours() || (h === hoy.getHours() && m <= hoy.getMinutes())) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
        const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
        return fechaA.getTime() - fechaB.getTime();
      });


    this.slotSeleccionado = null;
    this.reservaForm.reset({ tarjeta: null, modalidad: 'Virtual' });
    this.modalidadSeleccionada = 'Virtual';
    this.precioCalculado = 0;
    this.mostrarReservaModal = true;
  }

  cerrarReservaModal(): void {
    this.mostrarReservaModal = false;
    this.asesorReserva = null;
    this.slotSeleccionado = null;
    this.reservaForm.reset({ tarjeta: null, modalidad: 'Virtual' });
    this.modalidadSeleccionada = 'Virtual';
    this.precioCalculado = 0;
  }

  seleccionarSlot(slot: Disponibilidad): void {
    this.slotSeleccionado = slot;
    this.precioCalculado = this.calcularPrecio(slot);
  }

  calcularPrecio(slot: Disponibilidad): number {
    const [h1, m1] = slot.horaInicio.split(':').map(Number);
    const [h2, m2] = slot.horaFin.split(':').map(Number);
    const inicio = h1 + m1 / 60;
    const fin = h2 + m2 / 60;
    const horas = fin - inicio;
    return horas * 50;
  }

  confirmarReserva(): void {

    if (!this.slotSeleccionado) {
      alert('Seleccione un horario.');
      return;
    }
    if (this.reservaForm.invalid) {
      alert('Seleccione una tarjeta válida.');
      return;
    }

    const idCliente = Number(localStorage.getItem('idCliente'));
    const fecha = this.slotSeleccionado.fecha;
    const tarjetaSeleccionada = this.reservaForm.value.tarjeta;

    const reservaDTO = {
      idReserva: null,
      fechaHoraInicio: `${fecha}T${this.slotSeleccionado.horaInicio}`,
      fechaHoraFin: `${fecha}T${this.slotSeleccionado.horaFin}`,
      estado: 'Reservado',
      modalidad: 'Virtual', // fijo
      montoTotal: this.precioCalculado,

      cliente: { idCliente },
      asesor: { idAsesor: this.asesorReserva!.idAsesor },
      tarjeta: { idTarjeta: tarjetaSeleccionada.idTarjeta }
    };

    this.reservaService.insertar(reservaDTO).subscribe({
      next: () => {
        alert('Reserva realizada con éxito.');

        if (this.slotSeleccionado) this.slotSeleccionado.disponible = false;
        this.cerrarReservaModal();
        if (this.asesorReserva) this.cargarDisponibilidad(this.asesorReserva.idAsesor);
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear la reserva.');
      }
    });
  }


  abrirModalReservas(): void {
    const idCliente = Number(localStorage.getItem('idCliente'));
    const ahora = new Date();

    this.reservaService.listarPorCliente(idCliente).subscribe({
      next: (data) => {
        this.reservasCliente = data
          .filter(res => {
            if (!res.fechaHoraInicio) return false;
            const fechaReserva = new Date(res.fechaHoraInicio);
            return fechaReserva > ahora;
          })
          .sort((a, b) => {
            const fechaA = new Date(a.fechaHoraInicio);
            const fechaB = new Date(b.fechaHoraInicio);
            return fechaA.getTime() - fechaB.getTime();
          });

        this.mostrarModalReservas = true;
      },
      error: () => alert("Error al cargar tus reservas")
    });
  }

  cerrarModalReservas(): void {
    this.mostrarModalReservas = false;
  }

  eliminarReserva(reserva: Reserva): void {
    if (!confirm('¿Deseas cancelar esta reserva?')) return;

    this.reservaService.eliminar(reserva.idReserva).subscribe({
      next: () => {
        this.reservasCliente = this.reservasCliente.filter(r => r.idReserva !== reserva.idReserva);
        alert("Reserva eliminada.");
      },
      error: () => alert("No se pudo eliminar la reserva.")
    });
  }


  abrirReprogramar(reserva: Reserva): void {
    this.reservaAReprogramar = reserva;
    const idAsesor = reserva.asesor.idAsesor;
    this.horariosDisponiblesReprogramacion = [...(this.disponibilidades[idAsesor] || [])];
    this.nuevoHorarioSeleccionado = null;
    this.reprogramForm.reset({ nuevoHorario: null });
    this.mostrarModalReprogramar = true;
  }

  cerrarReprogramar(): void {
    this.mostrarModalReprogramar = false;
    this.reservaAReprogramar = null;
    this.nuevoHorarioSeleccionado = null;
    this.reprogramForm.reset();
  }

  confirmarReprogramacion(): void {
    if (!this.reservaAReprogramar) {
      alert("No hay reserva seleccionada.");
      return;
    }
    if (this.reprogramForm.invalid) {
      alert("Seleccione un horario válido.");
      return;
    }

    const d: Disponibilidad = this.reprogramForm.value.nuevoHorario;

    const reservaActualizada = {
      ...this.reservaAReprogramar,
      fechaHoraInicio: `${d.fecha}T${d.horaInicio}`,
      fechaHoraFin: `${d.fecha}T${d.horaFin}`
    };

    this.reservaService.actualizar(reservaActualizada).subscribe({
      next: () => {
        alert("Reserva reprogramada correctamente.");
        const idCliente = Number(localStorage.getItem('idCliente'));
        this.reservaService.listarPorCliente(idCliente).subscribe({
          next: (data) => {
            this.reservasCliente = data
              .filter(res => {
                const ahora = new Date();
                return new Date(res.fechaHoraInicio) > ahora;
              })
              .sort((a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime());
          }
        });
        this.cerrarReprogramar();
      },
      error: () => alert("Error al reprogramar")
    });
  }


  getIniciales(nombre: string): string {
    if (!nombre) return '??';
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getPlaceholderAvatar(nombre: string): string {
    return `https://placehold.co/150x150/f0f9ff/0f172a?text=${this.getIniciales(nombre)}`;
  }

  formatoHoraAmPm(hora: string): string {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    const num = parseInt(h, 10);
    const ampm = num >= 12 ? 'pm' : 'am';
    const hora12 = num % 12 === 0 ? 12 : num % 12;
    return m === '00' ? `${hora12}${ampm}` : `${hora12}:${m}${ampm}`;
  }
}
