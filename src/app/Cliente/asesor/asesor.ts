import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AsesorFinanciero } from '../../model/asesor-financiero';
import { Disponibilidad } from '../../model/disponibilidad';
import { CalificacionAsesor } from '../../model/calificacion-asesor';

import { AsesorService } from '../../services/asesor-service';
import { DisponibilidadService } from '../../services/disponibilidad-service';
import { CalificacionService } from '../../services/calificacion-asesor-service';

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

  public asesores: AsesorFinanciero[] = [];
  public disponibilidades: Record<number, Disponibilidad[]> = {};

  public mostrarReservaModal = false;
  public asesorReserva: AsesorFinanciero | null = null;
  public horariosVisibles: Disponibilidad[] = [];
  public slotSeleccionado: Disponibilidad | null = null;

  public mostrarResenaModal = false;
  public asesorSeleccionado: AsesorFinanciero | null = null;

  public resenas: Record<number, CalificacionAsesor[]> = {};

  public puntuacion = 0;
  public comentario = '';

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

  abrirModalResena(asesor: AsesorFinanciero): void {
    this.asesorSeleccionado = asesor;
    this.puntuacion = 0;
    this.comentario = '';
    this.mostrarResenaModal = true;
  }

  cerrarModalResena(): void {
    this.mostrarResenaModal = false;
    this.asesorSeleccionado = null;
    this.puntuacion = 0;
    this.comentario = '';
  }

  cargarResenas(idAsesor: number): void {
    this.calificacionService.listarPorAsesor(idAsesor).subscribe({
      next: (data) => {
        this.resenas[idAsesor] = data;
      },
      error: (err) => console.error(err),
    });
  }

  enviarResena(): void {
    if (!this.asesorSeleccionado) return;

    if (this.puntuacion < 1 || this.puntuacion > 5) {
      alert('Seleccione una calificación del 1 al 5.');
      return;
    }

    if (!this.comentario || this.comentario.length < 5) {
      alert('El comentario debe tener mínimo 5 caracteres.');
      return;
    }

    const dto = {
      puntuacion: this.puntuacion,
      comentario: this.comentario,
      idAsesor: this.asesorSeleccionado.idAsesor,
      idCliente: 1, // HARDCODE por ahora
    };

    this.calificacionService.insertar(dto).subscribe({
      next: () => {
        this.cargarResenas(this.asesorSeleccionado!.idAsesor);
        this.cerrarModalResena();
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar la reseña.');
      },
    });
  }

  abrirReserva(asesor: AsesorFinanciero): void {
    this.asesorReserva = asesor;
    this.horariosVisibles = this.disponibilidades[asesor.idAsesor] || [];
    this.slotSeleccionado = null;
    this.mostrarReservaModal = true;
  }

  cerrarReservaModal(): void {
    this.mostrarReservaModal = false;
    this.asesorReserva = null;
    this.horariosVisibles = [];
    this.slotSeleccionado = null;
  }

  seleccionarSlot(slot: Disponibilidad): void {
    this.slotSeleccionado = slot;
  }

  confirmarReserva(): void {
    if (!this.slotSeleccionado || !this.asesorReserva) return;
    alert('Reserva confirmada (simulación).');
    this.cerrarReservaModal();
  }

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
