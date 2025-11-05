import {Cliente} from './cliente';

export class GestionFinanciera {
  idGestion: number;
  titulo : string;
  tipo : string;
  monto : number;
  fecha : Date;
  cliente: Cliente;
}
