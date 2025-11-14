import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './asesor.html',
  styleUrls: ['./asesor.css'],
})
export class AsesorComponent implements OnInit {

  private asesorService = inject(AsesorService);
  private disponibilidadService = inject(DisponibilidadService);
  private calificacionService = inject(CalificacionService);
  private reservaService = inject(ReservaService);
  private tarjetaService = inject(TarjetaService);

  public asesores: AsesorFinanciero[] = [];
  public disponibilidades: Record<number, Disponibilidad[]> = {};

  // Reserva
  public mostrarReservaModal = false;
  public asesorReserva: AsesorFinanciero | null = null;
  public horariosVisibles: Disponibilidad[] = [];
  public slotSeleccionado: Disponibilidad | null = null;

  public modalidadSeleccionada = '';
  public tarjetas: Tarjeta[] = [];
  public tarjetaSeleccionada: Tarjeta | null = null;
  public precioCalculado = 0;

  // Reseñas
  public mostrarResenaModal = false;
  public asesorSeleccionado: AsesorFinanciero | null = null;
  public resenas: Record<number, CalificacionAsesor[]> = {};
  public puntuacion = 0;
  public comentario = '';

  ngOnInit(): void {
    this.cargarAsesores();
    this.cargarTarjetas();
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
    this.tarjetaService.list().subscribe({
      next: (data) => this.tarjetas = data,
      error: () => this.tarjetas = []
    });
  }

  // --------------------------------------------------------
  // RESEÑAS
  // --------------------------------------------------------

  abrirModalResena(asesor: AsesorFinanciero): void {
    this.asesorSeleccionado = asesor;
    this.puntuacion = 0;
    this.comentario = '';
    this.mostrarResenaModal = true;
  }

  cerrarModalResena(): void {
    this.mostrarResenaModal = false;
    this.asesorSeleccionado = null;
    this.comentario = '';
    this.puntuacion = 0;
  }

  enviarResena(): void {
    if (!this.asesorSeleccionado) return;

    if (this.puntuacion < 1 || this.puntuacion > 5) {
      alert('Seleccione una calificación válida (1–5).');
      return;
    }

    if (!this.comentario || this.comentario.length < 5) {
      alert('El comentario debe tener al menos 5 caracteres.');
      return;
    }

    const idCliente = Number(localStorage.getItem('idCliente'));

    const dto = {
      puntuacion: this.puntuacion,
      comentario: this.comentario,
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

  // --------------------------------------------------------
  // RESERVA
  // --------------------------------------------------------

  abrirReserva(asesor: AsesorFinanciero): void {
    this.cargarTarjetas();

    this.asesorReserva = asesor;
    this.horariosVisibles = this.disponibilidades[asesor.idAsesor] || [];
    this.slotSeleccionado = null;
    this.modalidadSeleccionada = '';
    this.tarjetaSeleccionada = null;
    this.precioCalculado = 0;
    this.mostrarReservaModal = true;
  }


  cerrarReservaModal(): void {
    this.mostrarReservaModal = false;
    this.asesorReserva = null;
    this.slotSeleccionado = null;
    this.modalidadSeleccionada = '';
    this.tarjetaSeleccionada = null;
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

    return horas * 50; // tarifa fija
  }

  confirmarReserva(): void {
    if (!this.slotSeleccionado || !this.asesorReserva || !this.tarjetaSeleccionada) {
      alert('Seleccione horario, modalidad y tarjeta.');
      return;
    }

    const idCliente = Number(localStorage.getItem('idCliente'));
    const fecha = this.slotSeleccionado.fecha;

    const reservaDTO = {
      idReserva: null,
      fechaHoraInicio: `${fecha}T${this.slotSeleccionado.horaInicio}`,
      fechaHoraFin: `${fecha}T${this.slotSeleccionado.horaFin}`,
      estado: 'Reservado',
      modalidad: this.modalidadSeleccionada,
      montoTotal: this.precioCalculado,


      cliente: {
        idCliente: idCliente
      },
      asesor: {
        idAsesor: this.asesorReserva.idAsesor
      },
      tarjeta: {
        idTarjeta: this.tarjetaSeleccionada.idTarjeta
      }
    };

    this.reservaService.insertar(reservaDTO).subscribe({
      next: () => {
        alert('Reserva realizada con éxito.');
        this.slotSeleccionado!.disponible = false;
        this.cerrarReservaModal();
        this.cargarDisponibilidad(this.asesorReserva!.idAsesor);
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear la reserva.');
      }
    });
  }


  // --------------------------------------------------------
  // UTILS
  // --------------------------------------------------------

  getIniciales(nombre: string): string {
    if (!nombre) return '??';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
