import {Perfil} from './perfil';
import {Credenciales} from './credenciales';

export class Cliente {
  idCliente:number;
  dni : string;
  nombre: string;
  password: string;
  email: string;
  telefono: string;
  sobreMi: string;

  iduser: Credenciales;
}
