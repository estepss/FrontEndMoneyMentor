import { Cliente } from './cliente';
import { AsesorFinanciero } from './asesor-financiero';

export interface CalificacionAsesor {
  idCalificacion: number;
  puntuacion: number;
  comentario: string;

  idAsesor: number;
  idCliente: number;
  nombreCliente?: string; // opcional por seguridad
}

