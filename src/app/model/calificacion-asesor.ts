import { Cliente } from './cliente';
import { AsesorFinanciero } from './asesor-financiero';

export class CalificacionAsesor {
  idCalificacion!: number;
  puntuacion!: number;
  comentario!: string;
  asesor!: AsesorFinanciero;
  cliente!: Cliente;
}
