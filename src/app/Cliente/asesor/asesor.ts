import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Modelos Reales que SÍ tienes
import { AsesorFinanciero } from '../../model/asesor-financiero';
import { Disponibilidad } from '../../model/disponibilidad';

// Servicios Reales que SÍ tienes
import { AsesorService } from '../../services/asesor-service';
import { DisponibilidadService } from '../../services/disponibilidad-service';

@Component({
  selector: 'app-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './asesor.html',
  styleUrls: ['./asesor.css'],
})
export class AsesorComponent implements OnInit {

  // --- Inyección de Servicios ---
  private asesorService = inject(AsesorService);
  private disponibilidadService = inject(DisponibilidadService);

  // --- ESTADO REAL (Conectado a Backend) ---
  public asesores: AsesorFinanciero[] = [];
  public disponibilidades: Record<number, Disponibilidad[]> = {}; // Almacén de disponibilidad por idAsesor

  // --- ESTADO DE MODAL DE RESERVA ---
  public mostrarReservaModal = false;
  public asesorReserva: AsesorFinanciero | null = null;
  public horariosVisibles: Disponibilidad[] = [];
  public slotSeleccionado: Disponibilidad | null = null;

  constructor() {}

  ngOnInit(): void {
    this.cargarAsesores();
  }

  /**
   * 1. Carga la lista de asesores desde el backend.
   */
  cargarAsesores(): void {
    this.asesorService.obtenerTodosLosAsesores().subscribe({
      next: (data) => {
        this.asesores = data;
        // 2. Por cada asesor, cargamos su disponibilidad real
        data.forEach(asesor => {
          this.cargarDisponibilidad(asesor.idAsesor);
        });
      },
      error: (err) => console.error('Error cargando asesores:', err)
    });
  }

  /**
   * 2. Carga la disponibilidad para un asesor específico.
   */
  cargarDisponibilidad(idAsesor: number): void {
    this.disponibilidadService.listByAsesor(idAsesor).subscribe({
      next: (data) => {
        // Almacenamos solo los slots que están marcados como 'disponible: true'
        this.disponibilidades[idAsesor] = data.filter(slot => slot.disponible);
      },
      error: (err) => {
        console.error(`Error cargando disponibilidad para asesor ${idAsesor}:`, err);
        this.disponibilidades[idAsesor] = []; // Dejar vacío si hay error
      }
    });
  }

  // ===============================================
  // LÓGICA DE RESERVA (CON DISPONIBILIDAD REAL)
  // ===============================================

  /**
   * Abre el modal de reserva y muestra los horarios REALES disponibles.
   */
  abrirReserva(asesor: AsesorFinanciero): void {
    this.asesorReserva = asesor;
    // Filtra la disponibilidad real para este asesor
    this.horariosVisibles = this.disponibilidades[asesor.idAsesor] || [];
    this.slotSeleccionado = null; // Resetea la selección anterior
    this.mostrarReservaModal = true;
  }

  cerrarReservaModal(): void {
    this.mostrarReservaModal = false;
    this.asesorReserva = null;
    this.horariosVisibles = [];
    this.slotSeleccionado = null;
  }

  /**
   * Selecciona un slot de tiempo del modal.
   */
  seleccionarSlot(slot: Disponibilidad): void {
    this.slotSeleccionado = slot;
  }

  /**
   * Confirma la reserva.
   * (Esta lógica la implementará tu compañero de Reservas,
   * por ahora solo cerramos el modal)
   */
  confirmarReserva(): void {
    if (!this.slotSeleccionado || !this.asesorReserva) {
      console.error("No se ha seleccionado un slot o asesor.");
      return;
    }

    console.log("Reservando slot:", this.slotSeleccionado);
    // AQUÍ IRÍA LA LLAMADA AL 'ReservaService'
    // Como no tenemos ese servicio, solo mostramos un mensaje y cerramos.

    alert('Reserva confirmada (simulación). El slot se marcará como ocupado.');

    // Aquí tu compañero de reservas llamaría al servicio
    // y luego actualizaría la disponibilidad:

    // const slotOcupado = { ...this.slotSeleccionado!, disponible: false };
    // this.disponibilidadService.update(slotOcupado).subscribe(() => {
    //     this.cargarDisponibilidad(this.asesorReserva!.idAsesor);
    // });

    this.cerrarReservaModal();
  }


  // ===============================================
  // MÉTODOS DE UTILIDAD
  // ===============================================

  /**
   * Genera iniciales para la imagen placeholder.
   */
  getIniciales(nombre: string): string {
    if (!nombre) return '...';
    return nombre
      .split(' ')
      .slice(0, 2) // Tomamos solo los primeros dos nombres/apellidos
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  /**
   * Genera una URL de placeholder.
   */
  getPlaceholderAvatar(nombre: string): string {
    const iniciales = this.getIniciales(nombre);
    return `https://placehold.co/150x150/f0f9ff/0f172a?text=${iniciales}`;
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
}
