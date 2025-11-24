import { Cliente } from './cliente';
import { AsesorFinanciero } from './asesor-financiero';

export class Chat {
  idChat!: number;
  cliente!: Cliente;
  asesor!: AsesorFinanciero;
  fechaHora!: Date;
  mensajes?: Mensaje[]; //
}

export class Mensaje {
  idMensaje!: number;
  idChat!: number;
  contenido!: string;
  emisor!: string; //
  fechaHora!: Date;
}
