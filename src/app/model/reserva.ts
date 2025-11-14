import { AsesorFinanciero } from './asesor-financiero';
import { Tarjeta } from './tarjeta';
import { Cliente } from './cliente';

export class Reserva {
  idReserva: number;
  fechaHoraInicio: string; // ISO
  fechaHoraFin: string;    // ISO
  estado: string;
  modalidad: string;
  cliente: Cliente;
  asesor: AsesorFinanciero;
  tarjeta: Tarjeta;
  montoTotal: number;
}
